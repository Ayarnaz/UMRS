public class HealthcareProfessional {
    private String slmcNo;
    private String nic;
    private String name;
    private String specialty; // Note: updated from Specialization to Specialty
    private String phoneNumber;
    private String email;
    private String address;
    private String healthInstituteNumber;
    private String role;

    // Default constructor
    public HealthcareProfessional() {
    }

    // Constructor with parameters
    public HealthcareProfessional(String slmcNo, String nic, String name, String specialty,
                                  String phoneNumber, String email, String address,
                                  String healthInstituteNumber, String role) {
        this.slmcNo = slmcNo;
        this.nic = nic;
        this.name = name;
        this.specialty = specialty;
        this.phoneNumber = phoneNumber;
        this.email = email;
        this.address = address;
        this.healthInstituteNumber = healthInstituteNumber;
        this.role = role;
    }

    // Getters and Setters
    public String getSlmcNo() {
        return slmcNo;
    }

    public void setSlmcNo(String slmcNo) {
        this.slmcNo = slmcNo;
    }

    public String getNic() {
        return nic;
    }

    public void setNic(String nic) {
        this.nic = nic;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getSpecialty() {
        return specialty;
    }

    public void setSpecialty(String specialty) {
        this.specialty = specialty;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getHealthInstituteNumber() {
        return healthInstituteNumber;
    }

    public void setHealthInstituteNumber(String healthInstituteNumber) {
        this.healthInstituteNumber = healthInstituteNumber;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }
}
