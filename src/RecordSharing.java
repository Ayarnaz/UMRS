public class RecordSharing {
    private int recordId;
    private String senderSlmc;
    private String senderInstituteId;
    private String receiverSlmc;
    private String receiverInstituteId;
    private String patientPHN;
    private String recordType;
    private String subType;
    private String filePath;
    private String status;
    private java.sql.Timestamp shareDate;
    private String senderType;
    private String receiverType;
    private String senderName;    // For display purposes
    private String receiverName;  // For display purposes

    // Default constructor
    public RecordSharing() {}

    // Constructor with essential fields
    public RecordSharing(String patientPHN, String recordType, String status) {
        this.patientPHN = patientPHN;
        this.recordType = recordType;
        this.status = status;
    }

    // Full constructor
    public RecordSharing(String senderSlmc, String senderInstituteId, 
                        String receiverSlmc, String receiverInstituteId,
                        String patientPHN, String recordType, 
                        String subType, String filePath, 
                        String status, String senderType, 
                        String receiverType) {
        this.senderSlmc = senderSlmc;
        this.senderInstituteId = senderInstituteId;
        this.receiverSlmc = receiverSlmc;
        this.receiverInstituteId = receiverInstituteId;
        this.patientPHN = patientPHN;
        this.recordType = recordType;
        this.subType = subType;
        this.filePath = filePath;
        this.status = status;
        this.senderType = senderType;
        this.receiverType = receiverType;
    }

    // Getters and Setters
    public int getRecordId() {
        return recordId;
    }

    public void setRecordId(int recordId) {
        this.recordId = recordId;
    }

    public String getSenderSlmc() {
        return senderSlmc;
    }

    public void setSenderSlmc(String senderSlmc) {
        this.senderSlmc = senderSlmc;
    }

    public String getSenderInstituteId() {
        return senderInstituteId;
    }

    public void setSenderInstituteId(String senderInstituteId) {
        this.senderInstituteId = senderInstituteId;
    }

    public String getReceiverSlmc() {
        return receiverSlmc;
    }

    public void setReceiverSlmc(String receiverSlmc) {
        this.receiverSlmc = receiverSlmc;
    }

    public String getReceiverInstituteId() {
        return receiverInstituteId;
    }

    public void setReceiverInstituteId(String receiverInstituteId) {
        this.receiverInstituteId = receiverInstituteId;
    }

    public String getPatientPHN() {
        return patientPHN;
    }

    public void setPatientPHN(String patientPHN) {
        this.patientPHN = patientPHN;
    }

    public String getRecordType() {
        return recordType;
    }

    public void setRecordType(String recordType) {
        this.recordType = recordType;
    }

    public String getSubType() {
        return subType;
    }

    public void setSubType(String subType) {
        this.subType = subType;
    }

    public String getFilePath() {
        return filePath;
    }

    public void setFilePath(String filePath) {
        this.filePath = filePath;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public java.sql.Timestamp getShareDate() {
        return shareDate;
    }

    public void setShareDate(java.sql.Timestamp shareDate) {
        this.shareDate = shareDate;
    }

    public String getSenderType() {
        return senderType;
    }

    public void setSenderType(String senderType) {
        this.senderType = senderType;
    }

    public String getReceiverType() {
        return receiverType;
    }

    public void setReceiverType(String receiverType) {
        this.receiverType = receiverType;
    }

    public String getSenderName() {
        return senderName;
    }

    public void setSenderName(String senderName) {
        this.senderName = senderName;
    }

    public String getReceiverName() {
        return receiverName;
    }

    public void setReceiverName(String receiverName) {
        this.receiverName = receiverName;
    }

    // Helper methods
    public String getSenderId() {
        return senderType.equals("PROFESSIONAL") ? senderSlmc : senderInstituteId;
    }

    public String getReceiverId() {
        return receiverType.equals("PROFESSIONAL") ? receiverSlmc : receiverInstituteId;
    }

    // toString method for debugging
    @Override
    public String toString() {
        return "RecordSharing{" +
               "recordId=" + recordId +
               ", patientPHN='" + patientPHN + '\'' +
               ", recordType='" + recordType + '\'' +
               ", status='" + status + '\'' +
               ", senderName='" + senderName + '\'' +
               ", receiverName='" + receiverName + '\'' +
               '}';
    }
} 