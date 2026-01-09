package com.gnomeshift.tisk.statistics;

import com.gnomeshift.tisk.stats.AssigneeStatisticsMapper;
import org.junit.jupiter.api.Test;
import org.mapstruct.factory.Mappers;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

class AssigneeStatisticsMapperTest {
    // Get mapper instance
    private final AssigneeStatisticsMapper mapper = Mappers.getMapper(AssigneeStatisticsMapper.class);

    @Test
    void convertSecondsToHours_ShouldCalculateCorrectly() {
        // 1 hour
        Double result = mapper.convertSecondsToHours(3600.0);
        assertEquals(1.0, result);

        // 1.5 hour
        result = mapper.convertSecondsToHours(5400.0);
        assertEquals(1.5, result);

        // Round to 2 digits
        result = mapper.convertSecondsToHours(3660.0);
        assertEquals(1.02, result);
    }

    @Test
    void convertSecondsToHours_ShouldReturnNull_WhenInputNull() {
        assertNull(mapper.convertSecondsToHours(null));
    }
}
