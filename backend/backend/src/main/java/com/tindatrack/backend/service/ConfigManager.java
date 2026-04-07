package com.tindatrack.backend.service;

public class ConfigManager {

    private static ConfigManager instance;

    // Private constructor (IMPORTANT)
    private ConfigManager() {}

    public static ConfigManager getInstance() {
        if (instance == null) {
            instance = new ConfigManager();
        }
        return instance;
    }

    public String getSystemName() {
        return "TindaTrack System";
    }
}