import java.sql.*;

public class HealthcareProfessionalDAO {

    private Connection conn;

    public HealthcareProfessionalDAO() {
        // Initialize the connection
        String url = "jdbc:sqlite:db/umrs.db";
        try {
            conn = DriverManager.getConnection(url);
            //System.out.println("Connected to the database.");
        } catch (SQLException e) {
            System.out.println("Connection failed: " + e.getMessage());
        }
    }

    // Method to close the connection
    public void closeConnection() {
        try {
            if (conn != null && !conn.isClosed()) {
                conn.close();
                //System.out.println("Connection closed.");
            }
        } catch (SQLException e) {
            System.out.println("Error closing connection: " + e.getMessage());
        }
    }

    // Create a new healthcare professional record in the database
    public void insertHealthcareProfessional(HealthcareProfessional professional) {
        String sql = "INSERT INTO Healthcare_Professional (SLMC_No, NIC, Name, Specialty, Phone_Number, Email, Address, Health_Institute_Number, Role) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
        
        try (PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, professional.getSlmcNo());
            pstmt.setString(2, professional.getNic());
            pstmt.setString(3, professional.getName());
            pstmt.setString(4, professional.getSpecialty());
            pstmt.setString(5, professional.getPhoneNumber());
            pstmt.setString(6, professional.getEmail());
            pstmt.setString(7, professional.getAddress());
            pstmt.setString(8, professional.getHealthInstituteNumber());
            pstmt.setString(9, professional.getRole());
            pstmt.executeUpdate();
            System.out.println("Healthcare Professional inserted successfully.");
        } catch (SQLException e) {
            System.out.println(e.getMessage());
        }
    }

    // Read a healthcare professional record from the database
    public HealthcareProfessional getHealthcareProfessional(String slmcNo) {
        String sql = "SELECT * FROM Healthcare_Professional WHERE SLMC_No = ?";
        HealthcareProfessional professional = null;

        try (PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, slmcNo);
            ResultSet rs = pstmt.executeQuery();

            if (rs.next()) {
                professional = new HealthcareProfessional();
                professional.setSlmcNo(rs.getString("SLMC_No"));
                professional.setNic(rs.getString("NIC"));
                professional.setName(rs.getString("Name"));
                professional.setSpecialty(rs.getString("Specialty"));
                professional.setPhoneNumber(rs.getString("Phone_Number"));
                professional.setEmail(rs.getString("Email"));
                professional.setAddress(rs.getString("Address"));
                professional.setHealthInstituteNumber(rs.getString("Health_Institute_Number"));
                professional.setRole(rs.getString("Role"));
            }
        } catch (SQLException e) {
            System.out.println(e.getMessage());
        }

        return professional;
    }

    // Update a healthcare professional record in the database
    public void updateHealthcareProfessional(HealthcareProfessional professional) {
        String sql = "UPDATE Healthcare_Professional SET NIC = ?, Name = ?, Specialty = ?, Phone_Number = ?, Email = ?, Address = ?, Health_Institute_Number = ?, Role = ? WHERE SLMC_No = ?";

        try (PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, professional.getNic());
            pstmt.setString(2, professional.getName());
            pstmt.setString(3, professional.getSpecialty());
            pstmt.setString(4, professional.getPhoneNumber());
            pstmt.setString(5, professional.getEmail());
            pstmt.setString(6, professional.getAddress());
            pstmt.setString(7, professional.getHealthInstituteNumber());
            pstmt.setString(8, professional.getRole());
            pstmt.setString(9, professional.getSlmcNo());
            pstmt.executeUpdate();
            System.out.println("Healthcare Professional updated successfully.");
        } catch (SQLException e) {
            System.out.println(e.getMessage());
        }
    }

    // Delete a healthcare professional record from the database
    public void deleteHealthcareProfessional(String slmcNo) {
        String sql = "DELETE FROM Healthcare_Professional WHERE SLMC_No = ?";

        try (PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, slmcNo);
            pstmt.executeUpdate();
            System.out.println("Healthcare Professional deleted successfully.");
        } catch (SQLException e) {
            System.out.println(e.getMessage());
        }
    }
}
