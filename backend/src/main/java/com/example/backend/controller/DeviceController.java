package com.example.backend.controller;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.dto.DeviceCreateRequestDto;
import com.example.backend.dto.DeviceResponseDto;
import com.example.backend.dto.DeviceUpdateRequestDto;
import com.example.backend.service.DeviceService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/devices")
public class DeviceController {

    private static final Logger LOGGER = LoggerFactory.getLogger(DeviceController.class);

    private final DeviceService deviceService;

    public DeviceController(DeviceService deviceService) {
        this.deviceService = deviceService;
    }

    @GetMapping
    public List<DeviceResponseDto> getDevices() {
        LOGGER.info("GET /devices aufgerufen");
        return deviceService.getAllDevices();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public DeviceResponseDto createDevice(@Valid @RequestBody DeviceCreateRequestDto request) {
        LOGGER.info("POST /devices aufgerufen für Gerät {}", request.name());
        return deviceService.createDevice(request);
    }

    @PutMapping("/{id}")
    public DeviceResponseDto updateDevice(@PathVariable Long id, @Valid @RequestBody DeviceUpdateRequestDto request) {
        LOGGER.info("PUT /devices/{} aufgerufen", id);
        return deviceService.updateDevice(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteDevice(@PathVariable Long id) {
        LOGGER.info("DELETE /devices/{} aufgerufen", id);
        deviceService.deleteDevice(id);
    }
}
