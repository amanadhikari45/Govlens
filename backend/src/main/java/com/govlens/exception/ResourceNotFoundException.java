package com.govlens.exception;

public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String entityName, Long id) {
        super(String.format("%s not found with id: %d", entityName, id));
    }

    public ResourceNotFoundException(String message) {
        super(message);
    }
}
