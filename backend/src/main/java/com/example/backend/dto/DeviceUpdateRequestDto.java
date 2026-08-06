package com.example.backend.dto;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record DeviceUpdateRequestDto(

    @Size(max = 255, message = "Name darf maximal 255 Zeichen lang sein")
    String name,

    @Size(max = 255, message = "Typ darf maximal 255 Zeichen lang sein")
    String type,

    @Size(max = 100, message = "Seriennummer darf maximal 100 Zeichen lang sein")
    String serialNumber,

    @Size(max = 255, message = "Standort darf maximal 255 Zeichen lang sein")
    String location,

    @Pattern(regexp = "^(aktiv|inaktiv)$",
             message = "Status muss 'aktiv' oder 'inaktiv' sein")
    String status

) {}