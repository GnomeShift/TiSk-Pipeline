package com.gnomeshift.tisk;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class TiSkApplication {

    public static void main(String[] args) {
        SpringApplication app = new SpringApplication(TiSkApplication.class);
        app.addInitializers(new DotenvPropertyInitializer());
        app.run(args);
    }

}
