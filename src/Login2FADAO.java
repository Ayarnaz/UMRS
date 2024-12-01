import java.security.SecureRandom;
import java.sql.*;
import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;

public class Login2FADAO {
    private static HikariDataSource dataSource;
    private static final int BUSY_TIMEOUT_MS = 30000; // 30 seconds
    private Connection conn;

    static {
        initializeDataSource();
    }

    private static void initializeDataSource() {
        HikariConfig config = new HikariConfig();
        config.setJdbcUrl("jdbc:sqlite:db/umrs.db");
        config.setMaximumPoolSize(5);
        config.setMinimumIdle(1);
        config.addDataSourceProperty("journal_mode", "WAL");
        config.addDataSourceProperty("busy_timeout", String.valueOf(BUSY_TIMEOUT_MS));
        dataSource = new HikariDataSource(config);
    }

    public Login2FADAO(Connection conn) {
        this.conn = conn;
    }

    // Insert a new login entry
    public void insertLogin(Login2FA login) {
        String sql = "INSERT INTO Login_2FA (User_Type, User_Identifier, Login_Username, " +
                "Login_Password, Salt, Portal_Type, TwoFA_Preference, Last_TwoFA_Code, TwoFA_Code_Timestamp) " +
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";

        try (PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, login.getUserType());
            pstmt.setString(2, login.getUserIdentifier());
            pstmt.setString(3, login.getLoginUsername());
            pstmt.setString(4, login.getLoginPassword());
            pstmt.setBytes(5, login.getSalt());
            pstmt.setString(6, login.getPortalType());
            pstmt.setString(7, login.getTwoFAPreference());
            pstmt.setString(8, login.getLastTwoFACode());
            pstmt.setTimestamp(9, new Timestamp(login.getTwoFACodeTimestamp().getTime()));
            pstmt.executeUpdate();
            System.out.println("Login entry inserted successfully.");
        } catch (SQLException e) {
            System.out.println("Error inserting login entry: " + e.getMessage());
        }
    }

    // Retrieve a login entry by username
    public Login2FA getLoginByUsername(String username) {
        String sql = "SELECT * FROM Login_2FA WHERE Login_Username = ?";
        Login2FA login = null;

        try (PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, username);
            ResultSet rs = pstmt.executeQuery();

            if (rs.next()) {
                login = new Login2FA();
                login.setLoginID(rs.getInt("Login_ID"));
                login.setUserType(rs.getString("User_Type"));
                login.setUserIdentifier(rs.getString("User_Identifier"));
                login.setLoginUsername(rs.getString("Login_Username"));
                login.setLoginPassword(rs.getString("Login_Password"));
                login.setSalt(rs.getBytes("Salt"));
                login.setPortalType(rs.getString("Portal_Type"));
                login.setTwoFAPreference(rs.getString("TwoFA_Preference"));
                login.setLastTwoFACode(rs.getString("Last_TwoFA_Code"));
                Timestamp timestamp = rs.getTimestamp("TwoFA_Code_Timestamp");
                login.setTwoFACodeTimestamp(timestamp != null ? 
                                            new java.util.Date(timestamp.getTime()) : 
                                            new java.util.Date());
                System.out.println("User found: " + login.getLoginUsername());
            } else {
                System.out.println("No user found with username: " + username);
            }
        } catch (SQLException e) {
            System.out.println("Error retrieving login by username: " + e.getMessage());
        }

        return login;
    }

    // Signup a new user
    public boolean signup(Login2FA newUser, String portalType) throws SQLException {
        System.out.println("Starting Login2FA signup process...");
        
        // Get the raw password BEFORE any modifications
        String rawPassword = newUser.getLoginPassword();
        System.out.println("Raw password received for hashing"); // Debug log
        
        if (rawPassword == null || rawPassword.trim().isEmpty()) {
            throw new SQLException("Password cannot be null or empty");
        }

        // Generate salt and hash password
        byte[] salt = new byte[16];
        SecureRandom random = new SecureRandom();
        random.nextBytes(salt);
        
        // Debug logs
        System.out.println("Salt generated, hashing password...");
        String hashedPassword = PasswordUtil.hashPassword(rawPassword, salt);
        System.out.println("Password hashed successfully");
        
        // Set the hashed password and salt
        newUser.setLoginPassword(hashedPassword);
        newUser.setSalt(salt);
        newUser.setPortalType(portalType);
        newUser.setUserIdentifier(newUser.getLoginUsername());

        String sql = "INSERT INTO Login_2FA (User_Type, User_Identifier, Login_Username, " +
                    "Login_Password, Salt, Portal_Type, TwoFA_Preference) " +
                    "VALUES (?, ?, ?, ?, ?, ?, ?)";

        try (PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, newUser.getUserType());
            pstmt.setString(2, newUser.getUserIdentifier());
            pstmt.setString(3, newUser.getLoginUsername());
            pstmt.setString(4, hashedPassword); // Use the hashed password
            pstmt.setBytes(5, salt);           // Store the salt
            pstmt.setString(6, newUser.getPortalType());
            pstmt.setString(7, newUser.getTwoFAPreference());
            
            System.out.println("Executing Login2FA insert with hashed password");
            int result = pstmt.executeUpdate();
            
            if (result > 0) {
                System.out.println("Login2FA entry created successfully with hashed password");
                return true;
            }
            return false;
        } catch (SQLException e) {
            System.err.println("Error in Login2FA signup: " + e.getMessage());
            throw e;
        }
    }

    // Login method
    public boolean login(String username, String password, String portalType) {
        System.out.println("\n=== Attempting Database Login ===");
        String sql = "SELECT * FROM Login_2FA WHERE Login_Username = ? AND Portal_Type = ?";
        
        try (PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, username);
            pstmt.setString(2, portalType);
            
            ResultSet rs = pstmt.executeQuery();
            
            if (rs.next()) {
                String storedPassword = rs.getString("Login_Password");
                byte[] salt = rs.getBytes("Salt");
                
                // Hash the provided password with the stored salt
                String hashedPassword = PasswordUtil.hashPassword(password, salt);
                
                // Compare the hashed passwords
                boolean matches = storedPassword.equals(hashedPassword);
                return matches;
            }
        } catch (SQLException e) {
            System.out.println("Database error during login:");
            e.printStackTrace();
        }
        return false;
    }

    // Method to generate a random 6-digit 2FA code
    public String generateTwoFACode() {
        SecureRandom random = new SecureRandom();
        int code = random.nextInt(900000) + 100000; // Generates a number between 100000 and 999999
        return String.valueOf(code);
        }

    public void storeLastTwoFACode(String username, String code) {
        String sql = "UPDATE Login_2FA SET Last_TwoFA_Code = ? WHERE Login_Username = ?";
        
        try (PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, code);
            pstmt.setString(2, username);
            pstmt.executeUpdate();
            System.out.println("Stored 2FA code for user: " + username);
        } catch (SQLException e) {
            System.out.println("Error storing 2FA code: " + e.getMessage());
        }
    }

    public void enableTwoFA(String username) {
        String code = AuthUtils.generateTwoFACode(); // Generate the 2FA code
        
        String sql = "UPDATE Login_2FA SET TwoFA_Enabled = ?, Last_TwoFA_Code = ? WHERE Login_Username = ?";
        
        try (PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setBoolean(1, true);
            pstmt.setString(2, code); // Store the generated code
            pstmt.setString(3, username);
            pstmt.executeUpdate();
            System.out.println("2FA enabled for user: " + username + " with code: " + code);
        } catch (SQLException e) {
            System.out.println("Error enabling 2FA: " + e.getMessage());
        }
    }

    public boolean identifierExists(String identifier) throws SQLException {
        String sql = "SELECT COUNT(*) FROM Login_2FA WHERE Login_Username = ?";
        try (PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, identifier);
            ResultSet rs = pstmt.executeQuery();
            return rs.getInt(1) > 0;
        }
    }

    // Add this new method
    public String getIdentifierForUser(String userType) {
        if (userType == null || userType.isEmpty()) {
            throw new IllegalArgumentException("User type is required");
        }

        if ("patient".equalsIgnoreCase(userType)) {
            return "PHN" + generatePersonalHealthNumber();
        }
        
        return null; // For other types, identifier should be provided externally
    }

    private String generatePersonalHealthNumber() {
        SecureRandom random = new SecureRandom();
        // Generate a 7-digit number (since we're adding "PHN" prefix)
        return String.format("%07d", random.nextInt(10000000));
    }
}

//summary of the changes made:

//Removed password hashing from the Login2FA class.
//Only hashed the password in the Login2FADAO class.
//Removed password hashing from the Login2FA constructor.
//Stored the salt value used to hash the password in the Login2FA object.
//Used the stored salt value to hash the password during login.

