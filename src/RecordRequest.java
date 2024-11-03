public class RecordRequest {
    private int requestId;
    private String requesterSlmc;
    private String requesterInstituteId;
    private String receiverSlmc;
    private String receiverInstituteId;
    private String patientPHN;
    private String recordType;
    private String purpose;
    private String status;
    private java.sql.Timestamp requestDate;
    private String requesterType;
    private String receiverType;
    private String requesterName;

    // Default constructor
    public RecordRequest() {}

    // Constructor with essential fields
    public RecordRequest(String patientPHN, String recordType, String purpose) {
        this.patientPHN = patientPHN;
        this.recordType = recordType;
        this.purpose = purpose;
        this.status = "pending";
    }

    // Full constructor
    public RecordRequest(String requesterSlmc, String requesterInstituteId,
                        String receiverSlmc, String receiverInstituteId,
                        String patientPHN, String recordType,
                        String purpose, String requesterType,
                        String receiverType) {
        this.requesterSlmc = requesterSlmc;
        this.requesterInstituteId = requesterInstituteId;
        this.receiverSlmc = receiverSlmc;
        this.receiverInstituteId = receiverInstituteId;
        this.patientPHN = patientPHN;
        this.recordType = recordType;
        this.purpose = purpose;
        this.status = "pending";
        this.requesterType = requesterType;
        this.receiverType = receiverType;
    }

    // Getters and Setters
    public int getRequestId() {
        return requestId;
    }

    public void setRequestId(int requestId) {
        this.requestId = requestId;
    }

    public String getRequesterSlmc() {
        return requesterSlmc;
    }

    public void setRequesterSlmc(String requesterSlmc) {
        this.requesterSlmc = requesterSlmc;
    }

    public String getRequesterInstituteId() {
        return requesterInstituteId;
    }

    public void setRequesterInstituteId(String requesterInstituteId) {
        this.requesterInstituteId = requesterInstituteId;
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

    public String getPurpose() {
        return purpose;
    }

    public void setPurpose(String purpose) {
        this.purpose = purpose;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public java.sql.Timestamp getRequestDate() {
        return requestDate;
    }

    public void setRequestDate(java.sql.Timestamp requestDate) {
        this.requestDate = requestDate;
    }

    public String getRequesterType() {
        return requesterType;
    }

    public void setRequesterType(String requesterType) {
        this.requesterType = requesterType;
    }

    public String getReceiverType() {
        return receiverType;
    }

    public void setReceiverType(String receiverType) {
        this.receiverType = receiverType;
    }

    public String getRequesterName() {
        return requesterName;
    }

    public void setRequesterName(String requesterName) {
        this.requesterName = requesterName;
    }

    // Helper methods
    public String getRequesterId() {
        return requesterType.equals("PROFESSIONAL") ? requesterSlmc : requesterInstituteId;
    }

    public String getReceiverId() {
        return receiverType.equals("PROFESSIONAL") ? receiverSlmc : receiverInstituteId;
    }

    @Override
    public String toString() {
        return "RecordRequest{" +
               "requestId=" + requestId +
               ", patientPHN='" + patientPHN + '\'' +
               ", recordType='" + recordType + '\'' +
               ", status='" + status + '\'' +
               ", requesterName='" + requesterName + '\'' +
               '}';
    }
} 