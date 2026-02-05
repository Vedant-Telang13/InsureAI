import java.time.LocalDate;

class Policy {

    // private variables (encapsulation)
    private int policyId;
    private String policyName;
    private double premiumAmount;
    private LocalDate startDate;
    private LocalDate endDate;

    // constructor
    public Policy(int policyId, String policyName, double premiumAmount,
                  LocalDate startDate, LocalDate endDate) {
        this.policyId = policyId;
        this.policyName = policyName;
        this.premiumAmount = premiumAmount;
        this.startDate = startDate;
        this.endDate = endDate;
    }

    // getters and setters
    public int getPolicyId() {
        return policyId;
    }

    public void setPolicyId(int policyId) {
        this.policyId = policyId;
    }

    public String getPolicyName() {
        return policyName;
    }

    public void setPolicyName(String policyName) {
        this.policyName = policyName;
    }

    public double getPremiumAmount() {
        return premiumAmount;
    }

    public void setPremiumAmount(double premiumAmount) {
        this.premiumAmount = premiumAmount;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    // business logic
    public boolean isActive() {
        LocalDate today = LocalDate.now();
        return (today.isEqual(startDate) || today.isAfter(startDate))
                && (today.isEqual(endDate) || today.isBefore(endDate));
    }
}

public class MainPolicy {
    public static void main(String[] args) {

        Policy policy = new Policy(
                101,
                "Corporate Health Policy",
                75000,
                LocalDate.of(2025, 1, 1),
                LocalDate.of(2026, 1, 1)
        );

        System.out.println("Policy Name: " + policy.getPolicyName());
        System.out.println("Premium: " + policy.getPremiumAmount());
        System.out.println("Is policy active? " + policy.isActive());
    }
}

