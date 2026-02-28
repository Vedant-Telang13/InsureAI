package com.insurai.model;

import jakarta.persistence.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

@Entity
@Table(name = "users")
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String firstname;

    @Column(nullable = false)
    private String lastname;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    private String phone;
    private String address;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // ── Constructors ─────────────────────────────────────────
    public User() {}

    public User(Long id, String firstname, String lastname, String email,
                String password, String phone, String address, Role role,
                LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.firstname = firstname;
        this.lastname = lastname;
        this.email = email;
        this.password = password;
        this.phone = phone;
        this.address = address;
        this.role = role;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // ── Builder ──────────────────────────────────────────────
    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private Long id;
        private String firstname, lastname, email, password, phone, address;
        private Role role;

        public Builder id(Long id)                   { this.id = id; return this; }
        public Builder firstname(String firstname)   { this.firstname = firstname; return this; }
        public Builder lastname(String lastname)     { this.lastname = lastname; return this; }
        public Builder email(String email)           { this.email = email; return this; }
        public Builder password(String password)     { this.password = password; return this; }
        public Builder phone(String phone)           { this.phone = phone; return this; }
        public Builder address(String address)       { this.address = address; return this; }
        public Builder role(Role role)               { this.role = role; return this; }

        public User build() {
            User u = new User();
            u.id = id; u.firstname = firstname; u.lastname = lastname;
            u.email = email; u.password = password; u.phone = phone;
            u.address = address; u.role = role;
            return u;
        }
    }

    // ── Getters ──────────────────────────────────────────────
    public Long getId()          { return id; }
    public String getFirstname() { return firstname; }
    public String getLastname()  { return lastname; }
    public String getEmail()     { return email; }
    public String getPhone()     { return phone; }
    public String getAddress()   { return address; }
    public Role getRole()        { return role; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }

    // ── Setters ──────────────────────────────────────────────
    public void setId(Long id)               { this.id = id; }
    public void setFirstname(String v)       { this.firstname = v; }
    public void setLastname(String v)        { this.lastname = v; }
    public void setEmail(String v)           { this.email = v; }
    public void setPassword(String v)        { this.password = v; }
    public void setPhone(String v)           { this.phone = v; }
    public void setAddress(String v)         { this.address = v; }
    public void setRole(Role v)              { this.role = v; }

    // ── Lifecycle ────────────────────────────────────────────
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // ── UserDetails ──────────────────────────────────────────
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    @Override public String getPassword()              { return password; }
    @Override public String getUsername()              { return email; }
    @Override public boolean isAccountNonExpired()     { return true; }
    @Override public boolean isAccountNonLocked()      { return true; }
    @Override public boolean isCredentialsNonExpired() { return true; }
    @Override public boolean isEnabled()               { return true; }
}
