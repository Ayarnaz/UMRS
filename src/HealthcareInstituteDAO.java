import java.sql.*;

public class HealthcareInstituteDAO {
    private Connection conn;

    public HealthcareInstituteDAO(Connection conn) {
        this.conn = conn;
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

    // Create a new healthcare institute record in the database
    public void insertHealthcareInstitute(HealthcareInstitute institute) throws SQLException {
        String sql = "INSERT INTO Healthcare_Institute (Health_Institute_Number, Name, Address, Email, Phone_Number, Type) VALUES (?, ?, ?, ?, ?, ?)";

        try (PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, institute.getHealthInstituteNumber());
            pstmt.setString(2, institute.getName());
            pstmt.setString(3, institute.getAddress());
            pstmt.setString(4, institute.getEmail());
            pstmt.setString(5, institute.getPhoneNumber());
            pstmt.setString(6, institute.getType());
            
            int result = pstmt.executeUpdate();
            if (result <= 0) {
                throw new SQLException("Failed to insert healthcare institute");
            }
            System.out.println("Healthcare Institute inserted successfully.");
        }
    }

    // Read a healthcare institute record from the database
    public HealthcareInstitute getHealthcareInstitute(String healthInstituteNumber) {
        String sql = "SELECT * FROM Healthcare_Institute WHERE Health_Institute_Number = ?";
        HealthcareInstitute institute = null;

        try (PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, healthInstituteNumber);
            ResultSet rs = pstmt.executeQuery();

            if (rs.next()) {
                institute = new HealthcareInstitute(
                    rs.getString("Health_Institute_Number"),
                    rs.getString("Name"),
                    rs.getString("Address"),
                    rs.getString("Email"),
                    rs.getString("Phone_Number"),
                    rs.getString("Type")
                );
            }
        } catch (SQLException e) {
            System.out.println(e.getMessage());
        }

        return institute;
    }

    // Update a healthcare institute record in the database
    public void updateHealthcareInstitute(HealthcareInstitute institute) {
        String sql = "UPDATE Healthcare_Institute SET Name = ?, Address = ?, Email = ?, Phone_Number = ?, Type = ? WHERE Health_Institute_Number = ?";

        try (PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, institute.getName());
            pstmt.setString(2, institute.getAddress());
            pstmt.setString(3, institute.getEmail());
            pstmt.setString(4, institute.getPhoneNumber());
            pstmt.setString(5, institute.getType());
            pstmt.setString(6, institute.getHealthInstituteNumber());
            pstmt.executeUpdate();
            System.out.println("Healthcare Institute updated successfully.");
        } catch (SQLException e) {
            System.out.println(e.getMessage());
        }
    }

    // Delete a healthcare institute record from the database
    public void deleteHealthcareInstitute(String healthInstituteNumber) {
        String sql = "DELETE FROM Healthcare_Institute WHERE Health_Institute_Number = ?";

        try (PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, healthInstituteNumber);
            pstmt.executeUpdate();
            System.out.println("Healthcare Institute deleted successfully.");
        } catch (SQLException e) {
            System.out.println(e.getMessage());
        }
    }

    public int getActiveProfessionalsCount(String instituteNumber) throws SQLException {
        String sql = "SELECT COUNT(*) FROM Healthcare_Professional WHERE Health_Institute_Number = ?";
        try (PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, instituteNumber);
            ResultSet rs = pstmt.executeQuery();
            return rs.next() ? rs.getInt(1) : 0;
        }
    }

    public int getActivePatientsCount(String instituteNumber) throws SQLException {
        String sql = "SELECT COUNT(DISTINCT Patient_PHN) FROM Medical_Record WHERE Health_Institute_Number = ?";
        try (PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, instituteNumber);
            ResultSet rs = pstmt.executeQuery();
            return rs.next() ? rs.getInt(1) : 0;
        }
    }
}
