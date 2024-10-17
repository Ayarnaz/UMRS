import java.sql.*;
import java.util.Vector;

public class MedicalDocumentDAO {
    private Connection conn;

    // Constructor
    public MedicalDocumentDAO(Connection conn) {
        this.conn = conn;
    }

    // Create a new medical document record in the database
    public void insertMedicalDocument(MedicalDocument medicalDocument) {
        String sql = "INSERT INTO Medical_Document (Record_ID, Document_Type, File_Path, Upload_Date, Uploaded_By, Details) VALUES (?, ?, ?, ?, ?, ?)";
        try (PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setInt(1, medicalDocument.getRecordID());
            pstmt.setString(2, medicalDocument.getDocumentType());
            pstmt.setString(3, medicalDocument.getFilePath());
            pstmt.setDate(4, medicalDocument.getUploadDate());
            pstmt.setString(5, medicalDocument.getUploadedBy());
            pstmt.setString(6, medicalDocument.getDetails());
            pstmt.executeUpdate();
            System.out.println("Medical Document inserted successfully.");
        } catch (SQLException e) {
            System.out.println(e.getMessage());
        }
    }

    // Read all documents associated with a medical record
    public Vector<MedicalDocument> getDocumentsByRecord(int recordID) {
        String sql = "SELECT * FROM Medical_Document WHERE Record_ID = ?";
        Vector<MedicalDocument> documents = new Vector<>();
        try (PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setInt(1, recordID);
            ResultSet rs = pstmt.executeQuery();
            while (rs.next()) {
                MedicalDocument document = new MedicalDocument(
                    rs.getInt("Record_ID"),
                    rs.getString("Document_Type"),
                    rs.getString("File_Path"),
                    rs.getDate("Upload_Date"),
                    rs.getString("Uploaded_By"),
                    rs.getString("Details")
                );
                document.setDocumentID(rs.getInt("Document_ID"));
                documents.add(document);
            }
        } catch (SQLException e) {
            System.out.println(e.getMessage());
        }
        return documents;
    }

    // Update a medical document record
    public void updateMedicalDocument(MedicalDocument medicalDocument) {
        String sql = "UPDATE Medical_Document SET Document_Type = ?, File_Path = ?, Upload_Date = ?, Uploaded_By = ?, Details = ? WHERE Document_ID = ?";
        try (PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, medicalDocument.getDocumentType());
            pstmt.setString(2, medicalDocument.getFilePath());
            pstmt.setDate(3, medicalDocument.getUploadDate());
            pstmt.setString(4, medicalDocument.getUploadedBy());
            pstmt.setString(5, medicalDocument.getDetails());
            pstmt.setInt(6, medicalDocument.getDocumentID());
            pstmt.executeUpdate();
            System.out.println("Medical Document updated successfully.");
        } catch (SQLException e) {
            System.out.println(e.getMessage());
        }
    }

    // Delete a medical document record
    public void deleteMedicalDocument(int documentID) {
        String sql = "DELETE FROM Medical_Document WHERE Document_ID = ?";
        try (PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setInt(1, documentID);
            pstmt.executeUpdate();
            System.out.println("Medical Document deleted successfully.");
        } catch (SQLException e) {
            System.out.println(e.getMessage());
        }
    }
}
