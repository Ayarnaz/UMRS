public class HealthcareInstitute {
    private String healthInstituteNumber; // Unique identifier
    private String name;
    private String address;
    private String email;
    private String phoneNumber;
    private String type;

    // Constructor
    public HealthcareInstitute(String healthInstituteNumber, String name, String address, String email, String phoneNumber, String type) {
        this.healthInstituteNumber = healthInstituteNumber;
        this.name = name;
        this.address = address;
        this.email = email;
        this.phoneNumber = phoneNumber;
        this.type = type;
    }

    // Getters and Setters
    public String getHealthInstituteNumber() {
        return healthInstituteNumber;
    }

    public void setHealthInstituteNumber(String healthInstituteNumber) {
        this.healthInstituteNumber = healthInstituteNumber;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }
}
