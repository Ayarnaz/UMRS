public class MedicalDocument {
    private int documentID;       // Unique identifier for the document
    private int recordID;         // ID of the associated medical record
    private String documentType;   // Type of the document (e.g., report, prescription)
    private String filePath;       // Path to the document file
    private java.sql.Date uploadDate; // Date the document was uploaded
    private String uploadedBy;     // Who uploaded the document
    private String details;        // Additional details about the document

    // Constructor
    public MedicalDocument(int recordID, String documentType, String filePath, 
                           java.sql.Date uploadDate, String uploadedBy, String details) {
        this.recordID = recordID;
        this.documentType = documentType;
        this.filePath = filePath;
        this.uploadDate = uploadDate;
        this.uploadedBy = uploadedBy;
        this.details = details;
    }

    // Getters and Setters
    public int getDocumentID() {
        return documentID;
    }

    public void setDocumentID(int documentID) {
        this.documentID = documentID;
    }

    public int getRecordID() {
        return recordID;
    }

    public void setRecordID(int recordID) {
        this.recordID = recordID;
    }

    public String getDocumentType() {
        return documentType;
    }

    public void setDocumentType(String documentType) {
        this.documentType = documentType;
    }

    public String getFilePath() {
        return filePath;
    }

    public void setFilePath(String filePath) {
        this.filePath = filePath;
    }

    public java.sql.Date getUploadDate() {
        return uploadDate;
    }

    public void setUploadDate(java.sql.Date uploadDate) {
        this.uploadDate = uploadDate;
    }

    public String getUploadedBy() {
        return uploadedBy;
    }

    public void setUploadedBy(String uploadedBy) {
        this.uploadedBy = uploadedBy;
    }

    public String getDetails() {
        return details;
    }

    public void setDetails(String details) {
        this.details = details;
    }
}
