package com.insurai.dto;

import com.insurai.model.Role;

public class AuthResponse {
    private String token;
    private Long userId;
    private String firstname;
    private String lastname;
    private String email;
    private Role role;

    // Getters
    public String getToken()     { return token; }
    public Long getUserId()      { return userId; }
    public String getFirstname() { return firstname; }
    public String getLastname()  { return lastname; }
    public String getEmail()     { return email; }
    public Role getRole()        { return role; }

    // Setters
    public void setToken(String v)     { this.token = v; }
    public void setUserId(Long v)      { this.userId = v; }
    public void setFirstname(String v) { this.firstname = v; }
    public void setLastname(String v)  { this.lastname = v; }
    public void setEmail(String v)     { this.email = v; }
    public void setRole(Role v)        { this.role = v; }

    // Builder
    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private String token;
        private Long userId;
        private String firstname, lastname, email;
        private Role role;

        public Builder token(String v)     { this.token = v; return this; }
        public Builder userId(Long v)      { this.userId = v; return this; }
        public Builder firstname(String v) { this.firstname = v; return this; }
        public Builder lastname(String v)  { this.lastname = v; return this; }
        public Builder email(String v)     { this.email = v; return this; }
        public Builder role(Role v)        { this.role = v; return this; }

        public AuthResponse build() {
            AuthResponse r = new AuthResponse();
            r.token = token; r.userId = userId;
            r.firstname = firstname; r.lastname = lastname;
            r.email = email; r.role = role;
            return r;
        }
    }
}