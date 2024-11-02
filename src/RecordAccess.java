import java.util.HashMap;
import java.util.Map;

public class RecordAccess {
    private int requestId;
    private String phn;
    private String slmcNo;
    private String purpose;
    private String requestDate;
    private String status;
    private boolean isEmergency;
    private String patientName; // For joining with Patient table

    // Default constructor
    public RecordAccess() {}

    // Constructor with fields
    public RecordAccess(int requestId, String phn, String slmcNo, String purpose, 
                       String requestDate, String status, boolean isEmergency) {
        this.requestId = requestId;
        this.phn = phn;
        this.slmcNo = slmcNo;
        this.purpose = purpose;
        this.requestDate = requestDate;
        this.status = status;
        this.isEmergency = isEmergency;
    }

    // Getters and Setters
    public int getRequestId() { return requestId; }
    public void setRequestId(int requestId) { this.requestId = requestId; }

    public String getPhn() { return phn; }
    public void setPhn(String phn) { this.phn = phn; }

    public String getSlmcNo() { return slmcNo; }
    public void setSlmcNo(String slmcNo) { this.slmcNo = slmcNo; }

    public String getPurpose() { return purpose; }
    public void setPurpose(String purpose) { this.purpose = purpose; }

    public String getRequestDate() { return requestDate; }
    public void setRequestDate(String requestDate) { this.requestDate = requestDate; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public boolean isEmergency() { return isEmergency; }
    public void setEmergency(boolean emergency) { isEmergency = emergency; }

    public String getPatientName() { return patientName; }
    public void setPatientName(String patientName) { this.patientName = patientName; }

    // Convert to Map for JSON response
    public Map<String, Object> toMap() {
        Map<String, Object> map = new HashMap<>();
        map.put("id", requestId);
        map.put("personalHealthNo", phn);
        map.put("patientName", patientName);
        map.put("purpose", purpose);
        map.put("requestDate", requestDate);
        map.put("status", status);
        map.put("isEmergency", isEmergency);
        return map;
    }
} 