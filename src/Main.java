//import java.sql.*;
import java.sql.Connection;
import java.sql.DriverManager;
//import java.sql.Date;
import java.sql.SQLException;

import com.google.gson.Gson;

import static spark.Spark.*;
//import java.util.Vector;
import java.util.Date;
//import java.util.Scanner;


//>>>>> javac --enable-preview --release 23 -cp "lib/*" -d bin src/*.java
//>>>>> java --enable-preview -cp "bin;lib/*" Main 

//javac -d bin src/Main.java
//javac -d bin -cp "lib/*;src" src/*.java

//--Compile all the src files together and then run the MAIN program
//javac -d bin src/*.java 
//java -cp "bin;lib/sqlite-jdbc-3.46.1.3.jar" Main 
 

public class Main { 
    public static void main(String[] args) {
        String url = "jdbc:sqlite:db/umrs.db";
        Gson gson = new Gson();
        final Connection[] connHolder = new Connection[1];
        
        // Database connection setup
        try {
            Class.forName("org.sqlite.JDBC");
            connHolder[0] = DriverManager.getConnection(url);
            if (connHolder[0] != null) {
                System.out.println("Connected to the database.");
            }
        } catch (ClassNotFoundException | SQLException e) {
            System.out.println("Database connection error: " + e.getMessage());
            return; // Exit if unable to connect to the database
        }
        
        // Set up Spark web server
        port(8080);

        // Enable CORS
        options("/*", (request, response) -> {
            String accessControlRequestHeaders = request.headers("Access-Control-Request-Headers");
            if (accessControlRequestHeaders != null) {
                response.header("Access-Control-Allow-Headers", accessControlRequestHeaders);
            }
            String accessControlRequestMethod = request.headers("Access-Control-Request-Method");
            if (accessControlRequestMethod != null) {
                response.header("Access-Control-Allow-Methods", accessControlRequestMethod);
            }
            return "OK";
        });

        before((request, response) -> {
            response.header("Access-Control-Allow-Origin", "*");
            response.type("application/json");
        });

        // Define API endpoints
        get("/patients", (req, res) -> {
            // TODO: Implement logic to retrieve patients from the database
            return gson.toJson(new ApiResponse("success", "List of patients"));
        });

        get("/patients/:id", (req, res) -> {
            // TODO: Implement logic to retrieve patient details from the database
            return gson.toJson(new ApiResponse("success", "Patient details for ID: " + req.params(":id")));
        });

        get("/appointments", (req, res) -> {
            // TODO: Implement logic to retrieve appointments from the database
            return gson.toJson(new ApiResponse("success", "List of appointments"));
        });

        get("/appointments/:id", (req, res) -> {
            // TODO: Implement logic to retrieve appointment details from the database
            return gson.toJson(new ApiResponse("success", "Appointment details for ID: " + req.params(":id")));
        });


        post("/login", (req, res) -> {
            String username = req.queryParams("username");
            String password = req.queryParams("password");
            String portalType = req.queryParams("portal_type"); // Get the portal type from the request
            
            Login2FADAO login2FADAO = new Login2FADAO(connHolder[0]);
            boolean isAuthenticated = login2FADAO.login(username, password, portalType);
            
            if (isAuthenticated) {
                // Generate a session token or JWT for the user
                String token = "generated_token_here"; // Implement actual token generation
                return gson.toJson(new ApiResponse("success", token));
            } else {
                return gson.toJson(new ApiResponse("error", "Invalid username or password"));
            }
        });

        post("/signup", (req, res) -> {
            String userType = req.queryParams("userType");
            String userIdentifier = req.queryParams("userIdentifier");
            String username = req.queryParams("username");
            String password = req.queryParams("password");
            String twoFAPreference = req.queryParams("twoFAPreference");
            String portalType = req.queryParams("portal_type");
            
            // Add null checks and default values
            if (userType == null) userType = "patient";
            if (twoFAPreference == null) twoFAPreference = "email";
            if (userIdentifier == null) userIdentifier = username;
            if (portalType == null) portalType = userType;
            
            Login2FA newUser = new Login2FA();
            newUser.setUserType(userType);
            newUser.setUserIdentifier(userIdentifier);
            newUser.setLoginUsername(username);
            newUser.setLoginPassword(password);
            newUser.setTwoFAPreference(twoFAPreference);
            newUser.setTwoFACodeTimestamp(new Date());
            
            Login2FADAO login2FADAO = new Login2FADAO(connHolder[0]);
            boolean isCreated = login2FADAO.signup(newUser, portalType);
            
            if (isCreated) {
                switch (userType) {
                    case "patient":
                        Patient newPatient = new Patient();
                        newPatient.setPersonalHealthNo(newUser.getUserIdentifier());
                        newPatient.setNIC(req.queryParams("nic"));
                        newPatient.setName(req.queryParams("name"));
                        newPatient.setDateOfBirth(req.queryParams("dob"));
                        newPatient.setGender(req.queryParams("gender"));
                        newPatient.setAddress(req.queryParams("address"));
                        newPatient.setPhoneNumber(req.queryParams("phoneNumber"));
                        newPatient.setEmail(req.queryParams("email"));
                        newPatient.setEmergencyContactName(req.queryParams("emergencyContactName"));
                        newPatient.setEmergencyContactPhone(req.queryParams("emergencyContactPhone"));
                        
                        PatientDAO patientDAO = new PatientDAO();
                        patientDAO.insertPatient(newPatient);
                        patientDAO.closeConnection();
                        break;
                    
                    case "healthcare_professional":
                        HealthcareProfessional newProfessional = new HealthcareProfessional();
                        newProfessional.setSlmcNo(newUser.getUserIdentifier());
                        newProfessional.setNic(req.queryParams("nic"));
                        newProfessional.setName(req.queryParams("name"));
                        newProfessional.setSpecialty(req.queryParams("specialty"));
                        newProfessional.setPhoneNumber(req.queryParams("phoneNumber"));
                        newProfessional.setEmail(req.queryParams("email"));
                        newProfessional.setAddress(req.queryParams("address"));
                        newProfessional.setHealthInstituteNumber(req.queryParams("healthInstituteNumber"));
                        newProfessional.setRole(req.queryParams("role"));
                        
                        HealthcareProfessionalDAO professionalDAO = new HealthcareProfessionalDAO();
                        professionalDAO.insertHealthcareProfessional(newProfessional);
                        professionalDAO.closeConnection();
                        break;
                    
                    case "healthcare_institute":
                        HealthcareInstitute newInstitute = new HealthcareInstitute(
                            newUser.getUserIdentifier(),
                            req.queryParams("name"),
                            req.queryParams("address"),
                            req.queryParams("email"),
                            req.queryParams("phoneNumber"),
                            req.queryParams("type")
                        );
                        
                        HealthcareInstituteDAO instituteDAO = new HealthcareInstituteDAO();
                        instituteDAO.insertHealthcareInstitute(newInstitute);
                        instituteDAO.closeConnection();
                        break;
                    
                    default:
                        return gson.toJson(new ApiResponse("error", "Invalid user type"));
                }
                
                return gson.toJson(new ApiResponse("success", "User created successfully"));
            } else {
                return gson.toJson(new ApiResponse("error", "Failed to create user"));
            }
        });

        // Error handling
        exception(Exception.class, (e, req, res) -> {
            res.status(500);
            res.body(gson.toJson(new ApiResponse("error", "Internal server error: " + e.getMessage())));
        });

        Runtime.getRuntime().addShutdownHook(new Thread(() -> {
            try {
                if (connHolder[0] != null) connHolder[0].close();
            } catch (SQLException e) {
                System.out.println("Error closing database connection: " + e.getMessage());
            }
        }));
    }

    // Simple API response class
    private static class ApiResponse {
        String status;
        String message;

        public ApiResponse(String status, String message) {
            this.status = status;
            this.message = message;
        }
    }
}