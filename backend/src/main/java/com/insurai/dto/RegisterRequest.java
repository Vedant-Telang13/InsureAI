package com.insurai.dto;

import com.insurai.model.Role;

public class RegisterRequest {
    private String firstname;
    private String lastname;
    private String email;
    private String password;
    private String phone;
    private Role role = Role.CUSTOMER;

    public String getFirstname() { return firstname; }
    public String getLastname()  { return lastname; }
    public String getEmail()     { return email; }
    public String getPassword()  { return password; }
    public String getPhone()     { return phone; }
    public Role getRole()        { return role; }

    public void setFirstname(String v) { this.firstname = v; }
    public void setLastname(String v)  { this.lastname = v; }
    public void setEmail(String v)     { this.email = v; }
    public void setPassword(String v)  { this.password = v; }
    public void setPhone(String v)     { this.phone = v; }
    public void setRole(Role v)        { this.role = v; }
}