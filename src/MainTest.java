import org.junit.jupiter.api.*;
import static org.junit.jupiter.api.Assertions.*;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.net.http.HttpResponse.BodyHandlers;
import java.time.Duration;
import org.junit.jupiter.api.DisplayName;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.*;

@DisplayName("API Endpoint Tests")
public class MainTest {
    
    private static final String BASE_URL = "http://localhost:8080";
    private static final HttpClient client = HttpClient.newHttpClient();
    private static long startTime;
    
    @BeforeAll
    static void setup() {
        System.out.println("\n=== Starting API Tests ===");
        startTime = System.currentTimeMillis();
    }
    
    @AfterAll
    static void teardown() {
        long duration = System.currentTimeMillis() - startTime;
        System.out.println("\n=== Test Summary ===");
        System.out.println("Total execution time: " + duration + "ms");
    }
    
    @BeforeEach
    void beforeEach(TestInfo testInfo) {
        System.out.println("\nExecuting: " + testInfo.getDisplayName());
    }

    @Test
    @DisplayName("POST /api/auth/login")
    void testLoginEndpoint() {
        try {
            JsonObject loginData = new JsonObject();
            loginData.addProperty("username", "testuser");
            loginData.addProperty("password", "testpass");
            loginData.addProperty("portalType", "patient");

            HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + "/api/auth/login"))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(loginData.toString()))
                .timeout(Duration.ofSeconds(10))
                .build();
                
            HttpResponse<String> response = client.send(request, BodyHandlers.ofString());
            
            System.out.println("Response Status: " + response.statusCode());
            System.out.println("Response Body: " + response.body());
            
            assertTrue(response.statusCode() == 200 || response.statusCode() == 401, 
                "Should return either 200 OK or 401 Unauthorized");
        } catch (Exception e) {
            fail("Login test failed: " + e.getMessage());
        }
    }

    @Test
    @DisplayName("GET /nonexistent - 404 Error")
    void testInvalidEndpoint() {
        try {
            HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + "/nonexistent"))
                .GET()
                .timeout(Duration.ofSeconds(10))
                .build();
                
            HttpResponse<String> response = client.send(request, BodyHandlers.ofString());
            
            System.out.println("Response Status: " + response.statusCode());
            assertEquals(404, response.statusCode(), "Should return 404 Not Found");
        } catch (Exception e) {
            fail("404 error test failed: " + e.getMessage());
        }
    }

    @Test
    @DisplayName("Performance Test")
    void testEndpointPerformance() {
        try {
            long startTime = System.currentTimeMillis();
            
            HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + "/patients"))
                .GET()
                .build();
                
            HttpResponse<String> response = client.send(request, BodyHandlers.ofString());
            
            long duration = System.currentTimeMillis() - startTime;
            System.out.println("Response Time: " + duration + "ms");
            
            assertTrue(duration < 1000, "Response should be faster than 1 second");
            assertEquals(200, response.statusCode(), "Should return 200 OK");
        } catch (Exception e) {
            fail("Performance test failed: " + e.getMessage());
        }
    }

    @Test
    @DisplayName("GET /appointments")
    void testListAppointments() {
        try {
            HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + "/appointments"))
                .GET()
                .timeout(Duration.ofSeconds(10))
                .build();
                
            HttpResponse<String> response = client.send(request, BodyHandlers.ofString());
            
            System.out.println("Response Status: " + response.statusCode());
            System.out.println("Response Body: " + response.body());
            
            assertEquals(200, response.statusCode(), "Should return 200 OK");
        } catch (Exception e) {
            fail("List appointments test failed: " + e.getMessage());
        }
    }

    @Test
    @DisplayName("GET /patients")
    void testListPatients() {
        try {
            HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + "/patients"))
                .GET()
                .timeout(Duration.ofSeconds(10))
                .build();
                
            HttpResponse<String> response = client.send(request, BodyHandlers.ofString());
            
            System.out.println("Response Status: " + response.statusCode());
            System.out.println("Response Body: " + response.body());
            
            assertEquals(200, response.statusCode(), "Should return 200 OK");
            assertTrue(response.body().contains("success"), "Response should contain 'success'");
        } catch (Exception e) {
            fail("Endpoint test failed: " + e.getMessage());
        }
    }

    @Test
    @DisplayName("GET /api/patient/medical-records")
    void testMedicalRecordsEnhanced() {
        try {
            HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + "/api/patient/medical-records?phn=PHN7115075"))
                .GET()
                .timeout(Duration.ofSeconds(10))
                .build();
                
            HttpResponse<String> response = client.send(request, BodyHandlers.ofString());
            
            assertThat("Status code should be 200", 
                response.statusCode(), is(200));

            JsonObject responseBody = JsonParser.parseString(response.body()).getAsJsonObject();
            
            assertThat("Response should contain medicalRecords", 
                responseBody.has("medicalRecords"), is(true));
            assertThat("Medical records should be an array", 
                responseBody.get("medicalRecords").isJsonArray(), is(true));
            
            System.out.println("\n=== Medical Records Test Results ===");
            System.out.println("Endpoint: " + request.uri());
            System.out.println("Status Code: " + response.statusCode());
            System.out.println("Records Found: " + responseBody.getAsJsonArray("medicalRecords").size());
            System.out.println("=====================================\n");
            
        } catch (Exception e) {
            fail("Medical records test failed: " + e.getMessage());
        }
    }

    @Test
    @DisplayName("POST /api/professional/medical-records")
    void testAddMedicalRecord() {
        try {
            JsonObject recordData = new JsonObject();
            recordData.addProperty("personalHealthNo", "PHN7115075");
            recordData.addProperty("slmcNo", "SLMC0113");
            recordData.addProperty("dateOfVisit", "2024-01-01");
            recordData.addProperty("type", "Consultation");
            recordData.addProperty("summary", "Test medical record");

            HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + "/api/professional/medical-records"))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(recordData.toString()))
                .timeout(Duration.ofSeconds(10))
                .build();
                
            HttpResponse<String> response = client.send(request, BodyHandlers.ofString());
            assertEquals(200, response.statusCode(), "Should return 200 OK");
        } catch (Exception e) {
            fail("Add medical record test failed: " + e.getMessage());
        }
    }

    @Test
    @DisplayName("GET /api/professional/analytics")
    void testProfessionalAnalyticsEnhanced() {
        try {
            HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + "/api/professional/analytics?slmcNo=SLMC0113"))
                .GET()
                .timeout(Duration.ofSeconds(10))
                .build();
                
            HttpResponse<String> response = client.send(request, BodyHandlers.ofString());
            
            // Enhanced assertions using Hamcrest
            assertThat("Status code should be 200", 
                response.statusCode(), is(200));

            // Parse and verify response body
            JsonObject responseBody = JsonParser.parseString(response.body()).getAsJsonObject();
            
            assertThat("Response should contain monthlyVisits", 
                responseBody.has("monthlyVisits"), is(true));
            assertThat("Response should contain commonDiagnoses", 
                responseBody.has("commonDiagnoses"), is(true));
            
            // Log detailed test results
            System.out.println("\n=== Professional Analytics Test Results ===");
            System.out.println("Endpoint: " + request.uri());
            System.out.println("Status Code: " + response.statusCode());
            System.out.println("Response Time: " + response.headers().firstValue("Date").orElse("N/A"));
            System.out.println("Content Type: " + response.headers().firstValue("Content-Type").orElse("N/A"));
            System.out.println("Body Preview: " + response.body().substring(0, Math.min(100, response.body().length())) + "...");
            System.out.println("Validation Results:");
            System.out.println("- Has Monthly Visits: " + responseBody.has("monthlyVisits"));
            System.out.println("- Has Common Diagnoses: " + responseBody.has("commonDiagnoses"));
            System.out.println("=====================================\n");
            
        } catch (Exception e) {
            fail("Professional analytics test failed: " + e.getMessage());
        }
    }

    @Test
    @DisplayName("GET /api/professional/dashboard")
    void testProfessionalDashboard() {
        try {
            HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + "/api/professional/dashboard?slmcNo=SLMC0113"))
                .GET()
                .timeout(Duration.ofSeconds(10))
                .build();
                
            HttpResponse<String> response = client.send(request, BodyHandlers.ofString());
            assertEquals(200, response.statusCode(), "Should return 200 OK");
        } catch (Exception e) {
            fail("Professional dashboard test failed: " + e.getMessage());
        }
    }

    @Test
    @DisplayName("GET /api/professional/appointments")
    void testProfessionalAppointments() {
        try {
            HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + "/api/professional/appointments?slmcNo=SLMC0113"))
                .GET()
                .timeout(Duration.ofSeconds(10))
                .build();
                
            HttpResponse<String> response = client.send(request, BodyHandlers.ofString());
            assertEquals(200, response.statusCode(), "Should return 200 OK");
        } catch (Exception e) {
            fail("Professional appointments test failed: " + e.getMessage());
        }
    }

    @Test
    @DisplayName("GET /api/professional/patients")
    void testProfessionalPatients() {
        try {
            HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + "/api/professional/patients?slmcNo=SLMC0113"))
                .GET()
                .timeout(Duration.ofSeconds(10))
                .build();
                
            HttpResponse<String> response = client.send(request, BodyHandlers.ofString());
            assertEquals(404, response.statusCode(), "Should return 404 Not Found");
        } catch (Exception e) {
            fail("Professional patients test failed: " + e.getMessage());
        }
    }

    @Test
    @DisplayName("GET /api/professional/statistics")
    void testProfessionalStatistics() {
        try {
            HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + "/api/professional/statistics?slmcNo=SLMC0113"))
                .GET()
                .timeout(Duration.ofSeconds(10))
                .build();
                
            HttpResponse<String> response = client.send(request, BodyHandlers.ofString());
            assertEquals(404, response.statusCode(), "Should return 404 Not Found");
        } catch (Exception e) {
            fail("Professional statistics test failed: " + e.getMessage());
        }
    }

    @Test
    @DisplayName("GET /api/institute/dashboard-stats")
    void testInstituteDashboardStats() {
        try {
            HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + "/api/institute/dashboard-stats?instituteId=INS001"))
                .GET()
                .timeout(Duration.ofSeconds(10))
                .build();
                
            HttpResponse<String> response = client.send(request, BodyHandlers.ofString());
            assertEquals(200, response.statusCode(), "Should return 200 OK");
        } catch (Exception e) {
            fail("Institute dashboard stats test failed: " + e.getMessage());
        }
    }

    @Test
    @DisplayName("GET /api/institute/appointments")
    void testInstituteAppointments() {
        try {
            HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + "/api/institute/appointments?instituteId=INS001"))
                .GET()
                .timeout(Duration.ofSeconds(10))
                .build();
                
            HttpResponse<String> response = client.send(request, BodyHandlers.ofString());
            assertEquals(200, response.statusCode(), "Should return 200 OK");
        } catch (Exception e) {
            fail("Institute appointments test failed: " + e.getMessage());
        }
    }

    @Test
    @DisplayName("GET /api/institute/professionals")
    void testInstituteProfessionals() {
        try {
            HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + "/api/institute/professionals?instituteId=INS001"))
                .GET()
                .timeout(Duration.ofSeconds(10))
                .build();
                
            HttpResponse<String> response = client.send(request, BodyHandlers.ofString());
            assertEquals(400, response.statusCode(), "Should return 400 Bad Request");
        } catch (Exception e) {
            fail("Institute professionals test failed: " + e.getMessage());
        }
    }

    @Test
    @DisplayName("GET /api/patient/profile")
    void testPatientProfile() {
        try {
            HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + "/api/patient/profile?phn=PHN7115075"))
                .GET()
                .timeout(Duration.ofSeconds(10))
                .build();
                
            HttpResponse<String> response = client.send(request, BodyHandlers.ofString());
            assertEquals(404, response.statusCode(), "Should return 404 Not Found");
        } catch (Exception e) {
            fail("Patient profile test failed: " + e.getMessage());
        }
    }

    @Test
    @DisplayName("POST /api/appointments/book")
    void testBookAppointment() {
        try {
            JsonObject appointmentData = new JsonObject();
            appointmentData.addProperty("patientPHN", "PHN7115075");
            appointmentData.addProperty("slmcNo", "SLMC0113");
            appointmentData.addProperty("dateTime", "2024-12-01T10:00:00");
            appointmentData.addProperty("type", "Consultation");

            HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + "/api/appointments/book"))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(appointmentData.toString()))
                .timeout(Duration.ofSeconds(10))
                .build();
                
            HttpResponse<String> response = client.send(request, BodyHandlers.ofString());
            assertEquals(404, response.statusCode(), "Should return 404 Not Found");
        } catch (Exception e) {
            fail("Book appointment test failed: " + e.getMessage());
        }
    }

    @Test
    @DisplayName("GET /api/patient/appointments")
    void testPatientAppointments() {
        try {
            HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + "/api/patient/appointments?phn=PHN7115075"))
                .GET()
                .timeout(Duration.ofSeconds(10))
                .build();
                
            HttpResponse<String> response = client.send(request, BodyHandlers.ofString());
            assertEquals(404, response.statusCode(), "Should return 404 Not Found");
        } catch (Exception e) {
            fail("Patient appointments test failed: " + e.getMessage());
        }
    }

    @Test
    @DisplayName("POST /api/auth/login - Invalid Credentials")
    void testLoginWithInvalidCredentials() {
        try {
            JsonObject loginData = new JsonObject();
            loginData.addProperty("username", "invalid");
            loginData.addProperty("password", "invalid");
            loginData.addProperty("portalType", "patient");

            HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + "/api/auth/login"))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(loginData.toString()))
                .timeout(Duration.ofSeconds(10))
                .build();
                
            HttpResponse<String> response = client.send(request, BodyHandlers.ofString());
            assertEquals(401, response.statusCode(), "Should return 401 Unauthorized");
        } catch (Exception e) {
            fail("Login test failed: " + e.getMessage());
        }
    }

    @Test
    @DisplayName("GET /api/professional/patient-prescriptions")
    void testProfessionalPatientPrescriptions() {
        try {
            HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + "/api/professional/patient-prescriptions?phn=PHN7115075&slmcNo=SLMC0113"))
                .header("Accept", "application/json")
                .GET()
                .timeout(Duration.ofSeconds(10))
                .build();
                
            HttpResponse<String> response = client.send(request, BodyHandlers.ofString());
            
            // Enhanced assertions
            assertThat("Status code should be 200", 
                response.statusCode(), is(200));
            
            // Parse and verify response body
            JsonObject responseBody = JsonParser.parseString(response.body()).getAsJsonObject();
            assertThat("Response should contain prescriptions", 
                responseBody.has("prescriptions"), is(true));
        } catch (Exception e) {
            fail("Professional patient prescriptions test failed: " + e.getMessage());
        }
    }

    @Test
    @DisplayName("GET /api/professional/patient-history")
    void testProfessionalPatientHistory() {
        try {
            HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + "/api/professional/patient-history?phn=PHN7115075&slmcNo=SLMC0113"))
                .header("Accept", "application/json")
                .GET()
                .timeout(Duration.ofSeconds(10))
                .build();
                
            HttpResponse<String> response = client.send(request, BodyHandlers.ofString());
            
            assertThat("Status code should be 200", 
                response.statusCode(), is(200));
            
            JsonObject responseBody = JsonParser.parseString(response.body()).getAsJsonObject();
            assertThat("Response should contain history", 
                responseBody.has("history"), is(true));
        } catch (Exception e) {
            fail("Professional patient history test failed: " + e.getMessage());
        }
    }

    @Test
    @DisplayName("GET /api/professional/patient-diagnoses")
    void testProfessionalPatientDiagnoses() {
        try {
            HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + "/api/professional/patient-diagnoses?phn=PHN7115075&slmcNo=SLMC0113"))
                .header("Accept", "application/json")
                .GET()
                .timeout(Duration.ofSeconds(10))
                .build();
                
            HttpResponse<String> response = client.send(request, BodyHandlers.ofString());
            
            assertThat("Status code should be 200", 
                response.statusCode(), is(200));
            
            JsonObject responseBody = JsonParser.parseString(response.body()).getAsJsonObject();
            assertThat("Response should contain diagnoses", 
                responseBody.has("diagnoses"), is(true));
        } catch (Exception e) {
            fail("Professional patient diagnoses test failed: " + e.getMessage());
        }
    }

    @Test
    @DisplayName("PUT /api/institute/appointments/:id")
    void testUpdateInstituteAppointment() {
        try {
            JsonObject updateData = new JsonObject();
            updateData.addProperty("status", "completed");
            updateData.addProperty("dateTime", "2024-12-01T10:00:00");
            updateData.addProperty("purpose", "Follow-up");

            HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + "/api/institute/appointments/1"))
                .header("Content-Type", "application/json")
                .PUT(HttpRequest.BodyPublishers.ofString(updateData.toString()))
                .timeout(Duration.ofSeconds(10))
                .build();
                
            HttpResponse<String> response = client.send(request, BodyHandlers.ofString());
            assertEquals(200, response.statusCode(), "Should return 200 OK");
        } catch (Exception e) {
            fail("Update institute appointment test failed: " + e.getMessage());
        }
    }

    @Test
    @DisplayName("DELETE /api/institute/appointments/:id")
    void testDeleteInstituteAppointment() {
        try {
            HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + "/api/institute/appointments/1"))
                .DELETE()
                .timeout(Duration.ofSeconds(10))
                .build();
                
            HttpResponse<String> response = client.send(request, BodyHandlers.ofString());
            assertEquals(200, response.statusCode(), "Should return 200 OK");
        } catch (Exception e) {
            fail("Delete institute appointment test failed: " + e.getMessage());
        }
    }

    @Test
    @DisplayName("PUT /api/patient/profile/:phn")
    void testUpdatePatientProfile() {
        try {
            JsonObject profileData = new JsonObject();
            profileData.addProperty("address", "123 Test St");
            profileData.addProperty("email", "test@example.com");
            profileData.addProperty("contactNo", "1234567890");

            HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + "/api/patient/profile/PHN7115075"))
                .header("Content-Type", "application/json")
                .PUT(HttpRequest.BodyPublishers.ofString(profileData.toString()))
                .timeout(Duration.ofSeconds(10))
                .build();
                
            HttpResponse<String> response = client.send(request, BodyHandlers.ofString());
            assertEquals(404, response.statusCode(), "Should return 404 Not Found");
        } catch (Exception e) {
            fail("Update patient profile test failed: " + e.getMessage());
        }
    }
} 