package com.sih.stressmonitoring.queue;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ScoringJob implements Serializable {
    private UUID checkinId;
    private UUID victimId;
    private String text;
    private String audioRef;
    private int attempt;
}
