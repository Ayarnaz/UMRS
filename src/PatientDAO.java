import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

public class PatientDAO {

    private Connection conn;

    // Constructor to open the connection once when creating PatientDAO
    public PatientDAO(Connection conn) {
        this.conn = conn;
    }

    // Create a new patient record in the database
    public void insertPatient(Patient patient) throws SQLException {
        String sql = "INSERT INTO PATIENT (Personal_Health_No, NIC, Name, Date_of_Birth, Gender, Address, " +
                     "Phone_Number, Email, Emergency_Contact_Name, Emergency_Contact_Phone, Height, Weight, " +
                     "BMI, Blood_Type, Medical_Conditions) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

        PreparedStatement pstmt = null;
        
        try {
            this.conn.setAutoCommit(false);  // Start transaction
            
            pstmt = this.conn.prepareStatement(sql);
            pstmt.setString(1, patient.getPersonalHealthNo());
            pstmt.setString(2, patient.getNIC());
            pstmt.setString(3, patient.getName());
            pstmt.setString(4, patient.getDateOfBirth());
            pstmt.setString(5, patient.getGender());
            pstmt.setString(6, patient.getAddress());
            pstmt.setString(7, patient.getPhoneNumber());
            pstmt.setString(8, patient.getEmail());
            pstmt.setString(9, patient.getEmergencyContactName());
            pstmt.setString(10, patient.getEmergencyContactPhone());
            pstmt.setFloat(11, patient.getHeight());
            pstmt.setFloat(12, patient.getWeight());
            pstmt.setFloat(13, patient.getBMI());
            pstmt.setString(14, patient.getBloodType());
            pstmt.setString(15, patient.getMedicalConditions());
            
            int affectedRows = pstmt.executeUpdate();
            if (affectedRows == 0) {
                throw new SQLException("Creating patient failed, no rows affected.");
            }
            
            this.conn.commit();  // Commit transaction
            System.out.println("Patient committed to database successfully.");
            
        } catch (SQLException e) {
            if (this.conn != null) {
                try {
                    this.conn.rollback();  // Rollback on error
                } catch (SQLException ex) {
                    ex.printStackTrace();
                }
            }
            throw e;  // Re-throw the exception
        } finally {
            if (pstmt != null) pstmt.close();
            this.conn.setAutoCommit(true);  // Reset auto-commit
        }
    }

    // Read a patient record from the database
    public Patient getPatient(String personalHealthNo) throws SQLException {
        return getPatientByPHN(personalHealthNo);  // Delegate to getPatientByPHN
    }

    public Patient getPatientByPHN(String personalHealthNo) {
        System.out.println("Fetching patient with PHN: " + personalHealthNo);
        String sql = "SELECT * FROM Patient WHERE Personal_Health_No = ?";
        
        try (PreparedStatement pstmt = this.conn.prepareStatement(sql)) {
            pstmt.setString(1, personalHealthNo);
            System.out.println("Executing SQL: " + sql);
            
            ResultSet rs = pstmt.executeQuery();
            
            if (rs.next()) {
                System.out.println("Patient found in database");
                Patient patient = new Patient();
                patient.setPersonalHealthNo(rs.getString("Personal_Health_No"));
                patient.setNIC(rs.getString("NIC"));
                patient.setName(rs.getString("Name"));
                
                // Fix date handling
                String dateStr = rs.getString("Date_of_Birth"); // Get as string instead of Date
                patient.setDateOfBirth(dateStr);  // Store as is
                
                patient.setGender(rs.getString("Gender"));
                patient.setAddress(rs.getString("Address"));
                patient.setPhoneNumber(rs.getString("Phone_Number"));
                patient.setEmail(rs.getString("Email"));
                patient.setEmergencyContactName(rs.getString("Emergency_Contact_Name"));
                patient.setEmergencyContactPhone(rs.getString("Emergency_Contact_Phone"));
                patient.setHeight(rs.getFloat("Height"));
                patient.setWeight(rs.getFloat("Weight"));
                patient.setBMI(rs.getFloat("BMI"));
                patient.setBloodType(rs.getString("Blood_Type"));
                patient.setMedicalConditions(rs.getString("Medical_Conditions"));
                
                System.out.println("Successfully created patient object");
                return patient;
            } else {
                System.out.println("No patient found with PHN: " + personalHealthNo);
            }
        } catch (SQLException e) {
            System.out.println("SQL Error in getPatientByPHN: " + e.getMessage());
            e.printStackTrace();
        }
        return null;
    }

    // Update a patient record in the database
    public void updatePatient(Patient patient) {
        String sql = "UPDATE PATIENT SET NIC = ?, Name = ?, Date_of_Birth = ?, Gender = ?, Address = ?, " +
                     "Phone_Number = ?, Email = ?, Emergency_Contact_Name = ?, Emergency_Contact_Phone = ?, " +
                     "Height = ?, Weight = ?, BMI = ?, Blood_Type = ?, Medical_Conditions = ? WHERE Personal_Health_No = ?";

        try (PreparedStatement pstmt = this.conn.prepareStatement(sql)) {
             
            // Set parameters for the update
            pstmt.setString(1, patient.getNIC());
            pstmt.setString(2, patient.getName());
            pstmt.setString(3, patient.getDateOfBirth());
            pstmt.setString(4, patient.getGender());
            pstmt.setString(5, patient.getAddress());
            pstmt.setString(6, patient.getPhoneNumber());
            pstmt.setString(7, patient.getEmail());
            pstmt.setString(8, patient.getEmergencyContactName());
            pstmt.setString(9, patient.getEmergencyContactPhone());
            pstmt.setFloat(10, patient.getHeight());
            pstmt.setFloat(11, patient.getWeight());
            pstmt.setFloat(12, patient.getBMI());
            pstmt.setString(13, patient.getBloodType());
            pstmt.setString(14, patient.getMedicalConditions());
            pstmt.setString(15, patient.getPersonalHealthNo());
            pstmt.executeUpdate(); // Execute the update
            System.out.println("Patient updated successfully.");
        } catch (SQLException e) {
            System.out.println("Update failed: " + e.getMessage());
        }
    }

    // Delete a patient record from the database
    public void deletePatient(String personalHealthNo) {
        String sql = "DELETE FROM PATIENT WHERE Personal_Health_No = ?";

        try (PreparedStatement pstmt = this.conn.prepareStatement(sql)) {             
            pstmt.setString(1, personalHealthNo);
            pstmt.executeUpdate(); // Execute the deletion
            System.out.println("Patient deleted successfully.");
        } catch (SQLException e) {
            System.out.println("Delete failed: " + e.getMessage());
        }
    }

    //method to close the connection when done - call this explicitly when needed
    public void closeConnection() {
        try {
            if (this.conn != null) {
                this.conn.close();
            }
        } catch (SQLException e) {
            System.out.println(e.getMessage());
        }
    }

    // Update getPatientByUsername to handle both username and PHN
    public Patient getPatientByUsername(String identifier) {
        String sql = "SELECT p.* FROM Patient p " +
                     "JOIN Login_2FA l ON p.Personal_Health_No = l.User_Identifier " +
                     "WHERE l.Login_Username = ? OR p.Personal_Health_No = ?";
                     
        try (PreparedStatement pstmt = this.conn.prepareStatement(sql)) {
            pstmt.setString(1, identifier);
            pstmt.setString(2, identifier);
            ResultSet rs = pstmt.executeQuery();
            
            if (rs.next()) {
                Patient patient = new Patient();
                patient.setPersonalHealthNo(rs.getString("Personal_Health_No"));
                patient.setNIC(rs.getString("NIC"));
                patient.setName(rs.getString("Name"));
                patient.setDateOfBirth(rs.getDate("Date_of_Birth").toString());
                patient.setGender(rs.getString("Gender"));
                patient.setAddress(rs.getString("Address"));
                patient.setPhoneNumber(rs.getString("Phone_Number"));
                patient.setEmail(rs.getString("Email"));
                patient.setEmergencyContactName(rs.getString("Emergency_Contact_Name"));
                patient.setEmergencyContactPhone(rs.getString("Emergency_Contact_Phone"));
                patient.setHeight(rs.getFloat("Height"));
                patient.setWeight(rs.getFloat("Weight"));
                patient.setBMI(rs.getFloat("BMI"));
                patient.setBloodType(rs.getString("Blood_Type"));
                patient.setMedicalConditions(rs.getString("Medical_Conditions"));
                return patient;
            }
        } catch (SQLException e) {
            System.out.println("Error fetching patient: " + e.getMessage());
            e.printStackTrace();
        }
        return null;
    }

    // Add this method for patient authentication
    public Patient authenticatePatient(String personalHealthNo, String nic) {
        String sql = "SELECT * FROM PATIENT WHERE Personal_Health_No = ? AND NIC = ?";
        
        try (PreparedStatement pstmt = this.conn.prepareStatement(sql)) {
            pstmt.setString(1, personalHealthNo);
            pstmt.setString(2, nic);
            
            System.out.println("Executing authentication query for PHN: " + personalHealthNo);
            
            ResultSet rs = pstmt.executeQuery();
            
            if (rs.next()) {
                System.out.println("Patient found, creating patient object");
                Patient patient = new Patient();
                patient.setPersonalHealthNo(rs.getString("Personal_Health_No"));
                patient.setNIC(rs.getString("NIC"));
                patient.setName(rs.getString("Name"));
                patient.setDateOfBirth(rs.getDate("Date_of_Birth").toString());
                patient.setGender(rs.getString("Gender"));
                patient.setAddress(rs.getString("Address"));
                patient.setPhoneNumber(rs.getString("Phone_Number"));
                patient.setEmail(rs.getString("Email"));
                patient.setEmergencyContactName(rs.getString("Emergency_Contact_Name"));
                patient.setEmergencyContactPhone(rs.getString("Emergency_Contact_Phone"));
                patient.setHeight(rs.getFloat("Height"));
                patient.setWeight(rs.getFloat("Weight"));
                patient.setBMI(rs.getFloat("BMI"));
                patient.setBloodType(rs.getString("Blood_Type"));
                patient.setMedicalConditions(rs.getString("Medical_Conditions"));
                
                System.out.println("Authentication successful for PHN: " + personalHealthNo);
                return patient;
            } else {
                System.out.println("No patient found with PHN: " + personalHealthNo);
            }
        } catch (SQLException e) {
            System.out.println("SQL Error during authentication:");
            e.printStackTrace();
        }
        
        return null;
    }

    // Add this method to verify if a PHN exists
    public boolean patientExists(String personalHealthNo) {
        String sql = "SELECT 1 FROM PATIENT WHERE Personal_Health_No = ?";
        
        try (PreparedStatement pstmt = this.conn.prepareStatement(sql)) {
            pstmt.setString(1, personalHealthNo);
            ResultSet rs = pstmt.executeQuery();
            return rs.next();
        } catch (SQLException e) {
            System.out.println("Error checking patient existence: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }
}
