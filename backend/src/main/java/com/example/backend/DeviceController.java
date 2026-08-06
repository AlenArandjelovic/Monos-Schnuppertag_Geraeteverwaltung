package com.example.backend;

import java.util.List;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
public class DeviceController {

    private final DeviceRepository deviceRepository;

    public DeviceController(DeviceRepository deviceRepository) {
        this.deviceRepository = deviceRepository;
    }

    @GetMapping("/devices")
    public List<Device> getDevices() {
        return deviceRepository.findAll();
    }

    @PostMapping("/devices")
    public Device createDevice(@RequestBody Device device) {
        if (!"aktiv".equals(device.getStatus()) && !"inaktiv".equals(device.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Status muss aktiv oder inaktiv sein.");
        }

        device.setId(null);
        device.setCreatedAt(null);
        return deviceRepository.save(device);
    }

    @DeleteMapping("/devices/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteDevice(@PathVariable Long id) {
        if (!deviceRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Gerät wurde nicht gefunden.");
        }

        deviceRepository.deleteById(id);
    }
}
