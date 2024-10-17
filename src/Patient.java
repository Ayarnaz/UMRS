public class Patient {
    private String personalHealthNo;
    private String NIC;
    private String name;
    private String dateOfBirth;
    private String gender;
    private String address;
    private String phoneNumber;
    private String email;
    private String emergencyContactName;
    private String emergencyContactPhone;
    private float height;
    private float weight;
    private float BMI;
    private String bloodType;
    private String medicalConditions;

    // Default Constructor
    public Patient() {
    }

    // Parameterized Constructor
    public Patient(String personalHealthNo, String NIC, String name, String dateOfBirth, String gender,
                   String address, String phoneNumber, String email, String emergencyContactName,
                   String emergencyContactPhone, float height, float weight, float BMI,
                   String bloodType, String medicalConditions) {
        this.personalHealthNo = personalHealthNo;
        this.NIC = NIC;
        this.name = name;
        this.dateOfBirth = dateOfBirth;
        this.gender = gender;
        this.address = address;
        this.phoneNumber = phoneNumber;
        this.email = email;
        this.emergencyContactName = emergencyContactName;
        this.emergencyContactPhone = emergencyContactPhone;
        this.height = height;
        this.weight = weight;
        this.BMI = BMI;
        this.bloodType = bloodType;
        this.medicalConditions = medicalConditions;
    }

    // Getters and Setters
    public String getPersonalHealthNo() {
        return personalHealthNo;
    }

    public void setPersonalHealthNo(String personalHealthNo) {
        this.personalHealthNo = personalHealthNo;
    }

    public String getNIC() {
        return NIC;
    }

    public void setNIC(String NIC) {
        this.NIC = NIC;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDateOfBirth() {
        return dateOfBirth;
    }

    public void setDateOfBirth(String dateOfBirth) {
        this.dateOfBirth = dateOfBirth;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
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

    public String getEmergencyContactName() {
        return emergencyContactName;
    }

    public void setEmergencyContactName(String emergencyContactName) {
        this.emergencyContactName = emergencyContactName;
    }

    public String getEmergencyContactPhone() {
        return emergencyContactPhone;
    }

    public void setEmergencyContactPhone(String emergencyContactPhone) {
        this.emergencyContactPhone = emergencyContactPhone;
    }

    public float getHeight() {
        return height;
    }

    public void setHeight(float height) {
        this.height = height;
    }

    public float getWeight() {
        return weight;
    }

    public void setWeight(float weight) {
        this.weight = weight;
    }

    public float getBMI() {
        return BMI;
    }

    public void setBMI(float BMI) {
        this.BMI = BMI;
    }

    public String getBloodType() {
        return bloodType;
    }

    public void setBloodType(String bloodType) {
        this.bloodType = bloodType;
    }

    public String getMedicalConditions() {
        return medicalConditions;
    }

    public void setMedicalConditions(String medicalConditions) {
        this.medicalConditions = medicalConditions;
    }
}
