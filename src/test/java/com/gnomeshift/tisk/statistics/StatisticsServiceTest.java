package com.gnomeshift.tisk.statistics;

import com.gnomeshift.tisk.stats.StatisticsService;
import com.gnomeshift.tisk.stats.TicketStatistics;
import com.gnomeshift.tisk.stats.TicketStatisticsDTO;
import com.gnomeshift.tisk.stats.TicketStatisticsMapper;
import com.gnomeshift.tisk.ticket.TicketRepository;
import com.gnomeshift.tisk.user.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDateTime;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@ActiveProfiles("test")
class StatisticsServiceTest {
    @Mock
    private TicketRepository ticketRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private TicketStatisticsMapper ticketStatisticsMapper;

    @InjectMocks
    private StatisticsService statisticsService;

    @Test
    void getAllStatistics_ShouldAggregateData() {
        // Arrange
        when(ticketRepository.count()).thenReturn(100L);
        when(ticketRepository.countByAssigneeIsNull()).thenReturn(10L);
        when(ticketRepository.countByCreatedAtAfter(any(LocalDateTime.class))).thenReturn(5L);
        when(ticketRepository.countByStatusClosedAfter(any(LocalDateTime.class))).thenReturn(2L);
        when(ticketRepository.countAverageResolutionTime()).thenReturn(3600.0);

        when(ticketStatisticsMapper.toDto(any(TicketStatistics.class)))
                .thenReturn(new TicketStatisticsDTO());

        TicketStatisticsDTO result = statisticsService.getAllStatistics();

        // Assert
        assertNotNull(result);
        verify(ticketRepository).count();
        verify(ticketRepository).countByAssigneeIsNull();
        verify(ticketStatisticsMapper).toDto(any(TicketStatistics.class));
    }

    @Test
    void getAssigneeStatisticsById_ShouldThrow_WhenUserNotFound() {
        UUID randomId = UUID.randomUUID();
        when(userRepository.existsById(randomId)).thenReturn(false);

        assertThrows(EntityNotFoundException.class,
                () -> statisticsService.getAssigneeStatisticsById(randomId));
    }
}
