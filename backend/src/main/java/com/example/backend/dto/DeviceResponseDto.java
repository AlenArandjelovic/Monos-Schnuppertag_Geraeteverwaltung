package com.example.backend.dto;

import java.time.LocalDate;

public record DeviceResponseDto(

    Long id,
    String name,
    String type,
    String serialNumber,
    String location,
    String status,
    LocalDate createdAt

) {}