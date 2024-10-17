import java.security.SecureRandom;
import java.util.Date;

public class Login2FA {
    private int loginID;
    private String userType;
    private String userIdentifier;
    private String loginUsername;
    private String loginPassword; // Store hashed password
    private byte[] salt;
    private String twoFAPreference;
    private String lastTwoFACode;
    private java.util.Date twoFACodeTimestamp;
    private String portalType;

    public Login2FA() {
    }

        public Login2FA(String userType, String userIdentifier, String loginUsername,
                    String loginPassword, String twoFAPreference, String lastTwoFACode,
                    java.util.Date twoFACodeTimestamp, String portalType) {
        this.userType = userType;
        this.userIdentifier = userIdentifier;
        this.loginUsername = loginUsername;
        this.loginPassword = loginPassword; // Remove password hashing
        this.twoFAPreference = twoFAPreference;
        this.lastTwoFACode = lastTwoFACode;
        this.twoFACodeTimestamp = twoFACodeTimestamp;
        this.portalType = portalType;
    }

    // Hash the password using PBKDF2
    public void setLoginPassword(String loginPassword) {
        this.loginPassword = loginPassword;
    }

    // Verify the password
    public boolean verifyPassword(String plainPassword) {
        return PasswordUtil.verifyPassword(plainPassword, this.loginPassword, this.salt);
    }

    // Getters and Setters
    public int getLoginID() {
        return loginID;
    }

    public void setLoginID(int loginID) {
        this.loginID = loginID;
    }

    public String getUserType() {
        return userType;
    }

    public void setUserType(String userType) {
        this.userType = userType;
    }

    public String getUserIdentifier() {
        return userIdentifier;
    }

    public void setUserIdentifier(String userIdentifier) {
        this.userIdentifier = userIdentifier;
    }

    public String getLoginUsername() {
        return loginUsername;
    }

    public void setLoginUsername(String loginUsername) {
        this.loginUsername = loginUsername;
    }

    public String getLoginPassword() {
        return loginPassword;
    }

    public byte[] getSalt() {
        return salt;
    }

    public void setSalt(byte[] salt) {
        this.salt = salt;
    }

    public String getTwoFAPreference() {
        return twoFAPreference;
    }

    public void setTwoFAPreference(String twoFAPreference) {
        this.twoFAPreference = twoFAPreference;
    }

    public String getLastTwoFACode() {
        return lastTwoFACode;
    }

    public void setLastTwoFACode(String lastTwoFACode) {
        this.lastTwoFACode = lastTwoFACode;
    }

    public java.util.Date getTwoFACodeTimestamp() {
        return twoFACodeTimestamp;
    }

    public void setTwoFACodeTimestamp(java.util.Date twoFACodeTimestamp) {
        this.twoFACodeTimestamp = twoFACodeTimestamp;
    }

    public String getPortalType() {
        return portalType;
    }

    public void setPortalType(String portalType) {
        this.portalType = portalType;
    }
}
