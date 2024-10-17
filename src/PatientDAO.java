import java.sql.*;

public class PatientDAO {

    private Connection conn;

    // Constructor to open the connection once when creating PatientDAO
    public PatientDAO() {
        this.conn = connect();
    }

    private Connection connect() {
        String url = "jdbc:sqlite:db/umrs.db";
        Connection conn = null;
        try {
            conn = DriverManager.getConnection(url);
            //System.out.println("Connected to the database.");
        } catch (SQLException e) {
            System.out.println("Connection failed: " + e.getMessage());
        }
        return conn;
    }

    // Create a new patient record in the database
    public void insertPatient(Patient patient) {
        String sql = "INSERT INTO PATIENT (Personal_Health_No, NIC, Name, Date_of_Birth, Gender, Address, " +
                     "Phone_Number, Email, Emergency_Contact_Name, Emergency_Contact_Phone, Height, Weight, " +
                     "BMI, Blood_Type, Medical_Conditions) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

            try (PreparedStatement pstmt = conn.prepareStatement(sql)) { // Establish a connection
                         
            // Set parameters
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
            pstmt.executeUpdate(); // Execute the update
            System.out.println("Patient inserted successfully.");
        } catch (SQLException e) {
            System.out.println("Insert failed: " + e.getMessage());
        }
    }

    // Read a patient record from the database
    public Patient getPatient(String personalHealthNo) {
        String sql = "SELECT * FROM PATIENT WHERE Personal_Health_No = ?";
        Patient patient = null;

        try (PreparedStatement pstmt = conn.prepareStatement(sql)) {
             
            pstmt.setString(1, personalHealthNo);
            ResultSet rs = pstmt.executeQuery(); // Execute the query

            if (rs.next()) {
                patient = new Patient();
                patient.setPersonalHealthNo(rs.getString("Personal_Health_No"));
                patient.setNIC(rs.getString("NIC"));
                patient.setName(rs.getString("Name"));
                patient.setDateOfBirth(rs.getString("Date_of_Birth"));
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
            }
        } catch (SQLException e) {
            System.out.println("Error retrieving patient: " + e.getMessage());
        }

        return patient; // Return the patient object
    }

    // Update a patient record in the database
    public void updatePatient(Patient patient) {
        String sql = "UPDATE PATIENT SET NIC = ?, Name = ?, Date_of_Birth = ?, Gender = ?, Address = ?, " +
                     "Phone_Number = ?, Email = ?, Emergency_Contact_Name = ?, Emergency_Contact_Phone = ?, " +
                     "Height = ?, Weight = ?, BMI = ?, Blood_Type = ?, Medical_Conditions = ? WHERE Personal_Health_No = ?";

        try (PreparedStatement pstmt = conn.prepareStatement(sql)) {
             
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

        try (PreparedStatement pstmt = conn.prepareStatement(sql)) {             
            pstmt.setString(1, personalHealthNo);
            pstmt.executeUpdate(); // Execute the deletion
            System.out.println("Patient deleted successfully.");
        } catch (SQLException e) {
            System.out.println("Delete failed: " + e.getMessage());
        }
    }

    //method to close the connection when done
    public void closeConnection() {
        try {
            if (conn != null) {
                conn.close();
                //System.out.println("Database connection closed.");
            }
        } catch (SQLException e) {
            System.out.println(e.getMessage());
        }
    }
}
