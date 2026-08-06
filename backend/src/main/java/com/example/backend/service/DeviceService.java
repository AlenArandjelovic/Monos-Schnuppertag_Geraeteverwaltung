package com.example.backend.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.backend.Device;
import com.example.backend.DeviceRepository;
import com.example.backend.dto.DeviceCreateRequestDto;
import com.example.backend.dto.DeviceResponseDto;
import com.example.backend.dto.DeviceUpdateRequestDto;
import com.example.backend.exception.ResourceNotFoundException;

@Service
@Transactional(readOnly = true)
public class DeviceService {

    private final DeviceRepository deviceRepository;

    public DeviceService(DeviceRepository deviceRepository) {
        this.deviceRepository = deviceRepository;
    }

    public List<DeviceResponseDto> getAllDevices() {
        return deviceRepository.findAll().stream()
                .map(this::toResponseDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public DeviceResponseDto createDevice(DeviceCreateRequestDto request) {
        Device device = new Device();
        device.setName(request.name());
        device.setType(request.type());
        device.setSerialNumber(request.serialNumber());
        device.setLocation(request.location());
        device.setStatus(request.status());

        Device saved = deviceRepository.save(device);
        return toResponseDto(saved);
    }

    @Transactional
    public DeviceResponseDto updateDevice(Long id, DeviceUpdateRequestDto request) {
        Device device = deviceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Gerät mit ID " + id + " wurde nicht gefunden."));

        if (request.name() != null) {
            device.setName(request.name());
        }
        if (request.type() != null) {
            device.setType(request.type());
        }
        if (request.serialNumber() != null) {
            device.setSerialNumber(request.serialNumber());
        }
        if (request.location() != null) {
            device.setLocation(request.location());
        }
        if (request.status() != null) {
            device.setStatus(request.status());
        }

        Device saved = deviceRepository.save(device);
        return toResponseDto(saved);
    }

    @Transactional
    public void deleteDevice(Long id) {
        if (!deviceRepository.existsById(id)) {
            throw new ResourceNotFoundException("Gerät mit ID " + id + " wurde nicht gefunden.");
        }
        deviceRepository.deleteById(id);
    }

    private DeviceResponseDto toResponseDto(Device device) {
        return new DeviceResponseDto(
                device.getId(),
                device.getName(),
                device.getType(),
                device.getSerialNumber(),
                device.getLocation(),
                device.getStatus(),
                device.getCreatedAt()
        );
    }
}
