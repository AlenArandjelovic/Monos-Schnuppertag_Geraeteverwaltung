package com.example.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record DeviceCreateRequestDto(

    @NotBlank(message = "Name ist erforderlich")
    @Size(max = 255, message = "Name darf maximal 255 Zeichen lang sein")
    String name,

    @NotBlank(message = "Typ ist erforderlich")
    @Size(max = 255, message = "Typ darf maximal 255 Zeichen lang sein")
    String type,

    @NotBlank(message = "Seriennummer ist erforderlich")
    @Size(max = 100, message = "Seriennummer darf maximal 100 Zeichen lang sein")
    String serialNumber,

    @NotBlank(message = "Standort ist erforderlich")
    @Size(max = 255, message = "Standort darf maximal 255 Zeichen lang sein")
    String location,

    @NotBlank(message = "Status ist erforderlich")
    @Pattern(regexp = "^(aktiv|inaktiv)$",
             message = "Status muss 'aktiv' oder 'inaktiv' sein")
    String status

) {}