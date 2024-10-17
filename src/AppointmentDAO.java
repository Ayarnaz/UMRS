import java.sql.*;
import java.util.Vector;

public class AppointmentDAO {
    private Connection conn;

    public AppointmentDAO(Connection conn) {
        this.conn = conn;
    }

    // Insert a new appointment
    public void insertAppointment(Appointment appointment) {
        String sql = "INSERT INTO Appointment (Personal_Health_No, SLMC_No, Health_Institute_Number, " +
                "Appointment_Date, Appointment_Time, Purpose, Status, Notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";

        try (PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, appointment.getPersonalHealthNo());
            pstmt.setString(2, appointment.getSlmcNo());
            pstmt.setString(3, appointment.getHealthInstituteNumber());
            pstmt.setDate(4, appointment.getAppointmentDate());
            pstmt.setTime(5, appointment.getAppointmentTime());
            pstmt.setString(6, appointment.getPurpose());
            pstmt.setString(7, appointment.getStatus());
            pstmt.setString(8, appointment.getNotes());
            pstmt.executeUpdate();
            System.out.println("Appointment inserted successfully.");
        } catch (SQLException e) {
            System.out.println(e.getMessage());
        }
    }

    // Retrieve appointments for a specific patient
    public Vector<Appointment> getAppointmentsByPatient(String personalHealthNo) {
        String sql = "SELECT * FROM Appointment WHERE Personal_Health_No = ?";
        Vector<Appointment> appointments = new Vector<>();

        try (PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, personalHealthNo);
            ResultSet rs = pstmt.executeQuery();

            while (rs.next()) {
                Appointment appointment = new Appointment();
                appointment.setAppointmentID(rs.getInt("Appointment_ID"));
                appointment.setPersonalHealthNo(rs.getString("Personal_Health_No"));
                appointment.setSlmcNo(rs.getString("SLMC_No"));
                appointment.setHealthInstituteNumber(rs.getString("Health_Institute_Number"));
                appointment.setAppointmentDate(rs.getDate("Appointment_Date"));
                appointment.setAppointmentTime(rs.getTime("Appointment_Time"));
                appointment.setPurpose(rs.getString("Purpose"));
                appointment.setStatus(rs.getString("Status"));
                appointment.setNotes(rs.getString("Notes"));
                appointments.add(appointment);
            }
        } catch (SQLException e) {
            System.out.println(e.getMessage());
        }

        return appointments;
    }

    // Update an appointment
    public void updateAppointment(Appointment appointment) {
        String sql = "UPDATE Appointment SET SLMC_No = ?, Health_Institute_Number = ?, " +
                "Appointment_Date = ?, Appointment_Time = ?, Purpose = ?, Status = ?, Notes = ? " +
                "WHERE Appointment_ID = ?";

        try (PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setString(1, appointment.getSlmcNo());
            pstmt.setString(2, appointment.getHealthInstituteNumber());
            pstmt.setDate(3, appointment.getAppointmentDate());
            pstmt.setTime(4, appointment.getAppointmentTime());
            pstmt.setString(5, appointment.getPurpose());
            pstmt.setString(6, appointment.getStatus());
            pstmt.setString(7, appointment.getNotes());
            pstmt.setInt(8, appointment.getAppointmentID());
            pstmt.executeUpdate();
            System.out.println("Appointment updated successfully.");
        } catch (SQLException e) {
            System.out.println(e.getMessage());
        }
    }

    // Delete an appointment
    public void deleteAppointment(int appointmentID) {
        String sql = "DELETE FROM Appointment WHERE Appointment_ID = ?";

        try (PreparedStatement pstmt = conn.prepareStatement(sql)) {
            pstmt.setInt(1, appointmentID);
            pstmt.executeUpdate();
            System.out.println("Appointment deleted successfully.");
        } catch (SQLException e) {
            System.out.println(e.getMessage());
        }
    }
}
