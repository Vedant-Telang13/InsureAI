import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.SQLException;

public class InsertPolicy {

    public static void main(String[] args) {

        String url = "jdbc:mysql://localhost:3306/insureai_db";
        String user = "root";
        String password = "Vedant@123"; // change this

        String sql = "INSERT INTO policy " +
                "(policy_id, policy_name, premium_amount, start_date, end_date) " +
                "VALUES (?, ?, ?, ?, ?)";

        try (
                Connection conn = DriverManager.getConnection(url, user, password);
                PreparedStatement ps = conn.prepareStatement(sql)
        ) {

            ps.setInt(1, 301);
            ps.setString(2, "Corporate Health =Policy");
            ps.setDouble(3, 25000);
            ps.setDate(4, java.sql.Date.valueOf("2025-01-21"));
            ps.setDate(5, java.sql.Date.valueOf("2026-01-01"));

            int rowsInserted = ps.executeUpdate();

            if (rowsInserted > 0) {
                System.out.println("Policy inserted successfully!");
            }

        } catch (SQLException e) {
            e.printStackTrace();
        }
    }
}
