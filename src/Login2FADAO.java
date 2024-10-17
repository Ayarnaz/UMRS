import java.sql.*;
import java.security.SecureRandom;

public class Login2FADAO {
    private Connection conn;

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
    }
        } catch (SQLException e) {
            System.out.println("Error retrieving login by username: " + e.getMessage());
        }

        return login;
    }

    // Signup a new user
    public boolean signup(Login2FA newUser, String portalType) {

        newUser.setPortalType(portalType);

        // Validate input fields
        if (newUser.getLoginUsername() == null || newUser.getLoginUsername().trim().isEmpty()) {
            System.out.println("Username cannot be empty.");
            return false;
        }
        
        if (newUser.getLoginPassword() == null || newUser.getLoginPassword().length() < 6) {
            System.out.println("Password must be at least 6 characters long.");
            return false;
        }

        
        // Check if username already exists
        if (getLoginByUsername(newUser.getLoginUsername()) != null) {
            System.out.println("Username already exists!");
            return false;
        }
        // Handle different user types
        if (newUser.getUserType().equals("patient")) {
            // Generate Personal Health Number for patient
            String generatedPHN = generatePersonalHealthNumber();
            newUser.setLoginUsername(generatedPHN);
        } else if (newUser.getUserType().equals("healthcare_professional")) {
            // Use SLMC number as username
            newUser.setLoginUsername(newUser.getUserIdentifier()); // Assuming userIdentifier is SLMC_No
        } else if (newUser.getUserType().equals("institute")) {
            // Use Institute number as username
            newUser.setLoginUsername(newUser.getUserIdentifier()); // Assuming userIdentifier is Institute_No
        }
        
        // Hash the password
        byte[] salt = new byte[16]; // Generate a random salt
        SecureRandom random = new SecureRandom();
        random.nextBytes(salt);
        String hashedPassword = PasswordUtil.hashPassword(newUser.getLoginPassword(), salt);
        newUser.setLoginPassword(hashedPassword); // Set the hashed password
        newUser.setSalt(salt); // Set the salt value
        
        // Debug: Output the hashed password
        System.out.println("Hashed Password: " + hashedPassword);
        
        // Insert new login entry
        insertLogin(newUser);
        System.out.println("Signup successful!");
        return true;
    }

    // Generate a unique Personal Health number for patients
    private String generatePersonalHealthNumber() {
        // Example: Generate a random 10-digit number
        SecureRandom random = new SecureRandom();
        int phn = 1000000000 + random.nextInt(900000000); // Random 10-digit number
        return String.valueOf(phn);
    }

    // Login method
    public boolean login(String username, String password, String portalType) {
        Login2FA login = getLoginByUsername(username);
        if (login != null) {
            // Verify the password
            boolean isVerified = PasswordUtil.verifyPassword(password, login.getLoginPassword(), login.getSalt());

            // Debug: Show the verification result
            System.out.println("Password verification result: " + isVerified);

            // Check if the portal type matches
            if (isVerified && login.getPortalType().equals(portalType)) {
                return true;
            }
        }
        System.out.println("User  not found or portal type does not match!");
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
}

//summary of the changes made:

//Removed password hashing from the Login2FA class.
//Only hashed the password in the Login2FADAO class.
//Removed password hashing from the Login2FA constructor.
//Stored the salt value used to hash the password in the Login2FA object.
//Used the stored salt value to hash the password during login.