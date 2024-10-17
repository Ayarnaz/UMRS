public class Appointment {
    private int appointmentID;
    private String personalHealthNo;
    private String slmcNo;
    private String healthInstituteNumber;
    private java.sql.Date appointmentDate;
    private java.sql.Time appointmentTime;
    private String purpose;
    private String status;
    private String notes;

    public Appointment() {
    }

    public Appointment(String personalHealthNo, String slmcNo, String healthInstituteNumber,
                      java.sql.Date appointmentDate, java.sql.Time appointmentTime,
                      String purpose, String status, String notes) {
        this.personalHealthNo = personalHealthNo;
        this.slmcNo = slmcNo;
        this.healthInstituteNumber = healthInstituteNumber;
        this.appointmentDate = appointmentDate;
        this.appointmentTime = appointmentTime;
        this.purpose = purpose;
        this.status = status;
        this.notes = notes;
    }

    // Getters and Setters
    public int getAppointmentID() {
        return appointmentID;
    }

    public void setAppointmentID(int appointmentID) {
        this.appointmentID = appointmentID;
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

    public java.sql.Date getAppointmentDate() {
        return appointmentDate;
    }

    public void setAppointmentDate(java.sql.Date appointmentDate) {
        this.appointmentDate = appointmentDate;
    }

    public java.sql.Time getAppointmentTime() {
        return appointmentTime;
    }

    public void setAppointmentTime(java.sql.Time appointmentTime) {
        this.appointmentTime = appointmentTime;
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

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
