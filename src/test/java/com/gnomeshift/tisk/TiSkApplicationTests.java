package com.gnomeshift.tisk;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
@DisplayName("TiSk Application Tests")
class TiSkApplicationTests {

    @Test
    void contextLoads() {
    }

    @Test
    @DisplayName("Main method runs without exceptions")
    void mainMethodRunsWithoutExceptions() {
        // Verify that main method exists and is callable
        TiSkApplication.main(new String[]{"--spring.profiles.active=test"});
    }
}
