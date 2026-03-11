package com.tindatrack.backend.dto;

import com.google.gson.annotations.SerializedName;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class GoogleUserInfo {
    private String sub;        // Google sends "sub" as the user ID
    private String email;
    private String name;
    @SerializedName("given_name")
    private String givenName;
    @SerializedName("family_name")
    private String familyName;
    private String picture;
    private String locale;
    @SerializedName("email_verified")
    private boolean emailVerified;
}