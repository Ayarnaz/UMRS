import java.sql.Date;

public class MedicalRecord {
    private int recordID; // Record ID for the medical record
    private String personalHealthNo;
    private String slmcNo;
    private String healthInstituteNumber;
    private Date dateOfVisit;
    private String diagnosis;
    private String treatment;
    private String notes;
    private String accessRequests;

    // Constructor
    public MedicalRecord(String personalHealthNo, String slmcNo, String healthInstituteNumber, 
                         Date dateOfVisit, String diagnosis, String treatment, 
                         String notes, String accessRequests) {
        this.personalHealthNo = personalHealthNo;
        this.slmcNo = slmcNo;
        this.healthInstituteNumber = healthInstituteNumber;
        this.dateOfVisit = dateOfVisit;
        this.diagnosis = diagnosis;
        this.treatment = treatment;
        this.notes = notes;
        this.accessRequests = accessRequests;
    }

    // Getters and Setters
    public int getRecordID() {
        return recordID;
    }

    public void setRecordID(int recordID) {
        this.recordID = recordID;
    }

    public String getPersonalHealthNo() {
        return personalHealthNo;
    }

    public void setPersonalHealthNo(String personalHealthNo) {
        this.personalHealthNo = personalHealthNo;
    }

    public String getSlmcNo() {
        return slmcNo;
    }

    public void setSlmcNo(String slmcNo) {
        this.slmcNo = slmcNo;
    }

    public String getHealthInstituteNumber() {
        return healthInstituteNumber;
    }

    public void setHealthInstituteNumber(String healthInstituteNumber) {
        this.healthInstituteNumber = healthInstituteNumber;
    }

    public Date getDateOfVisit() {
        return dateOfVisit;
    }

    public void setDateOfVisit(Date dateOfVisit) {
        this.dateOfVisit = dateOfVisit;
    }

    public String getDiagnosis() {
        return diagnosis;
    }

    public void setDiagnosis(String diagnosis) {
        this.diagnosis = diagnosis;
    }

    public String getTreatment() {
        return treatment;
    }

    public void setTreatment(String treatment) {
        this.treatment = treatment;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public String getAccessRequests() {
        return accessRequests;
    }

    public void setAccessRequests(String accessRequests) {
        this.accessRequests = accessRequests;
    }
}
