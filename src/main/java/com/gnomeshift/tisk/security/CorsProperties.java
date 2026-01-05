package com.gnomeshift.tisk.security;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.DefaultValue;
import org.springframework.validation.annotation.Validated;

import java.util.List;

@ConfigurationProperties(prefix = "cors")
@Validated
public record CorsProperties(@DefaultValue("*")
                             List<String> allowedOrigins,

                             @DefaultValue("GET, POST, PUT, PATCH, DELETE, OPTIONS")
                             List<String> allowedMethods,

                             @DefaultValue("Authorization, Content-Type, X-Requested-With, Accept")
                             List<String> allowedHeaders,

                             @DefaultValue("Authorization")
                             List<String> exposedHeaders,

                             @DefaultValue("3600")
                             Long maxAge
) {}
