import java.security.SecureRandom;

public class AuthUtils {
    private static final SecureRandom random = new SecureRandom();

    public static String generateTwoFACode() {
        int code = random.nextInt(999999); // Generate a number between 0 and 999999
        return String.format("%06d", code); // Format to 6 digits
    }
}
