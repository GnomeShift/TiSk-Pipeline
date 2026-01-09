package com.gnomeshift.tisk.ticket;

import com.gnomeshift.tisk.user.User;
import com.gnomeshift.tisk.user.UserRepository;
import com.gnomeshift.tisk.user.UserRole;
import com.gnomeshift.tisk.user.UserStatus;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@ActiveProfiles("test")
@DisplayName("TicketService Tests")
class TicketServiceTest {
    @Mock
    private TicketRepository ticketRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private TicketMapper ticketMapper;

    @InjectMocks
    private TicketService ticketService;

    private Ticket testTicket;
    private TicketDTO testTicketDTO;
    private User testUser;
    private User testAssignee;
    private CreateTicketDTO createTicketDTO;
    private UpdateTicketDTO updateTicketDTO;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(UUID.randomUUID())
                .email("user@example.com")
                .password("password")
                .firstName("Test")
                .lastName("User")
                .login("testuser")
                .role(UserRole.USER)
                .status(UserStatus.ACTIVE)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        testAssignee = User.builder()
                .id(UUID.randomUUID())
                .email("support@example.com")
                .password("password")
                .firstName("Support")
                .lastName("User")
                .login("supportuser")
                .role(UserRole.SUPPORT)
                .status(UserStatus.ACTIVE)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        testTicket = Ticket.builder()
                .id(UUID.randomUUID())
                .title("Test Ticket")
                .description("Test Description")
                .status(TicketStatus.OPEN)
                .priority(TicketPriority.MEDIUM)
                .reporter(testUser)
                .assignee(null)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        testTicketDTO = TicketDTO.builder()
                .id(testTicket.getId())
                .title(testTicket.getTitle())
                .description(testTicket.getDescription())
                .status(testTicket.getStatus())
                .priority(testTicket.getPriority())
                .createdAt(testTicket.getCreatedAt())
                .updatedAt(testTicket.getUpdatedAt())
                .build();

        createTicketDTO = new CreateTicketDTO();
        createTicketDTO.setTitle("New Ticket");
        createTicketDTO.setDescription("New Description");
        createTicketDTO.setPriority(TicketPriority.HIGH);
        createTicketDTO.setReporterId(testUser.getId());

        updateTicketDTO = new UpdateTicketDTO();
        updateTicketDTO.setTitle("Updated Title");
    }

    @Nested
    @DisplayName("Get all tickets Tests")
    class GetAllTicketsTests {
        @Test
        @DisplayName("Return all tickets")
        void shouldReturnAllTickets() {
            when(ticketRepository.findAll()).thenReturn(List.of(testTicket));
            when(ticketMapper.toDtoList(anyList())).thenReturn(List.of(testTicketDTO));

            List<TicketDTO> result = ticketService.getAllTickets();

            assertThat(result).hasSize(1);
            assertThat(result.getFirst().getTitle()).isEqualTo("Test Ticket");
        }

        @Test
        @DisplayName("Return empty list when no tickets")
        void shouldReturnEmptyListWhenNoTickets() {
            when(ticketRepository.findAll()).thenReturn(List.of());
            when(ticketMapper.toDtoList(anyList())).thenReturn(List.of());

            List<TicketDTO> result = ticketService.getAllTickets();

            assertThat(result).isEmpty();
        }
    }

    @Nested
    @DisplayName("Get ticket by ID Tests")
    class GetTicketByIdTests {
        @Test
        @DisplayName("Return ticket by id")
        void shouldReturnTicketById() {
            when(ticketRepository.findById(any(UUID.class))).thenReturn(Optional.of(testTicket));
            when(ticketMapper.toDto(any(Ticket.class))).thenReturn(testTicketDTO);

            TicketDTO result = ticketService.getTicketById(testTicket.getId());

            assertThat(result).isNotNull();
            assertThat(result.getTitle()).isEqualTo("Test Ticket");
        }

        @Test
        @DisplayName("Throw exception when ticket not found")
        void shouldThrowExceptionWhenTicketNotFound() {
            when(ticketRepository.findById(any(UUID.class))).thenReturn(Optional.empty());

            assertThatThrownBy(() -> ticketService.getTicketById(UUID.randomUUID()))
                    .isInstanceOf(EntityNotFoundException.class)
                    .hasMessageContaining("Ticket not found");
        }
    }

    @Nested
    @DisplayName("Get my tickets Tests")
    class GetMyTicketsTests {
        @Test
        @DisplayName("Return tickets by reporter email")
        void shouldReturnTicketsByReporterEmail() {
            when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(testUser));
            when(ticketRepository.findAllByReporter(any(User.class))).thenReturn(List.of(testTicket));
            when(ticketMapper.toDtoList(anyList())).thenReturn(List.of(testTicketDTO));

            List<TicketDTO> result = ticketService.getMyTickets("user@example.com");

            assertThat(result).hasSize(1);
        }

        @Test
        @DisplayName("Throw exception when user not found")
        void shouldThrowExceptionWhenUserNotFound() {
            when(userRepository.findByEmail(anyString())).thenReturn(Optional.empty());

            assertThatThrownBy(() -> ticketService.getMyTickets("notfound@example.com"))
                    .isInstanceOf(EntityNotFoundException.class);
        }
    }

    @Nested
    @DisplayName("Create ticket Tests")
    class CreateTicketTests {
        @Test
        @DisplayName("Create ticket successfully")
        void shouldCreateTicket() {
            when(userRepository.findById(any(UUID.class))).thenReturn(Optional.of(testUser));
            when(ticketMapper.toEntity(any(CreateTicketDTO.class))).thenReturn(testTicket);
            when(ticketRepository.save(any(Ticket.class))).thenReturn(testTicket);
            when(ticketMapper.toDto(any(Ticket.class))).thenReturn(testTicketDTO);

            TicketDTO result = ticketService.createTicket(createTicketDTO);

            assertThat(result).isNotNull();
            verify(ticketRepository).save(any(Ticket.class));
        }

        @Test
        @DisplayName("Throw exception when reporter not found")
        void shouldThrowExceptionWhenReporterNotFound() {
            when(userRepository.findById(any(UUID.class))).thenReturn(Optional.empty());

            assertThatThrownBy(() -> ticketService.createTicket(createTicketDTO))
                    .isInstanceOf(EntityNotFoundException.class);

            verify(ticketRepository, never()).save(any(Ticket.class));
        }
    }

    @Nested
    @DisplayName("Update ticket Tests")
    class UpdateTicketTests {
        @Test
        @DisplayName("Update ticket successfully")
        void shouldUpdateTicket() {
            when(ticketRepository.findById(any(UUID.class))).thenReturn(Optional.of(testTicket));
            when(ticketRepository.save(any(Ticket.class))).thenReturn(testTicket);
            when(ticketMapper.toDto(any(Ticket.class))).thenReturn(testTicketDTO);

            TicketDTO result = ticketService.updateTicket(testTicket.getId(), updateTicketDTO);

            assertThat(result).isNotNull();
            verify(ticketMapper).updateTicketFromDto(any(UpdateTicketDTO.class), any(Ticket.class));
            verify(ticketRepository).save(any(Ticket.class));
        }

        @Test
        @DisplayName("Update reporter when reporterId provided")
        void shouldUpdateReporterWhenReporterIdProvided() {
            updateTicketDTO.setReporterId(testUser.getId());

            when(ticketRepository.findById(any(UUID.class))).thenReturn(Optional.of(testTicket));
            when(userRepository.findById(testUser.getId())).thenReturn(Optional.of(testUser));
            when(ticketRepository.save(any(Ticket.class))).thenReturn(testTicket);
            when(ticketMapper.toDto(any(Ticket.class))).thenReturn(testTicketDTO);

            ticketService.updateTicket(testTicket.getId(), updateTicketDTO);

            verify(userRepository).findById(testUser.getId());
        }

        @Test
        @DisplayName("Throw exception when ticket not found")
        void shouldThrowExceptionWhenTicketNotFound() {
            when(ticketRepository.findById(any(UUID.class))).thenReturn(Optional.empty());

            assertThatThrownBy(() -> ticketService.updateTicket(UUID.randomUUID(), updateTicketDTO))
                    .isInstanceOf(EntityNotFoundException.class);
        }
    }

    @Nested
    @DisplayName("Assign ticket Tests")
    class AssignTicketTests {
        @Test
        @DisplayName("Assign ticket to user")
        void shouldAssignTicketToUser() {
            when(ticketRepository.findById(any(UUID.class))).thenReturn(Optional.of(testTicket));
            when(userRepository.findById(any(UUID.class))).thenReturn(Optional.of(testAssignee));
            when(ticketRepository.save(any(Ticket.class))).thenReturn(testTicket);
            when(ticketMapper.toDto(any(Ticket.class))).thenReturn(testTicketDTO);

            TicketDTO result = ticketService.assignTicket(testTicket.getId(), testAssignee.getId());

            assertThat(result).isNotNull();
            verify(ticketRepository).save(any(Ticket.class));
        }

        @Test
        @DisplayName("Change status to IN_PROGRESS when assigning OPEN ticket")
        void shouldChangeStatusToInProgressWhenAssigningOpenTicket() {
            testTicket.setStatus(TicketStatus.OPEN);

            when(ticketRepository.findById(any(UUID.class))).thenReturn(Optional.of(testTicket));
            when(userRepository.findById(any(UUID.class))).thenReturn(Optional.of(testAssignee));
            when(ticketRepository.save(any(Ticket.class))).thenAnswer(invocation -> {
                Ticket saved = invocation.getArgument(0);
                assertThat(saved.getStatus()).isEqualTo(TicketStatus.IN_PROGRESS);
                return saved;
            });
            when(ticketMapper.toDto(any(Ticket.class))).thenReturn(testTicketDTO);

            ticketService.assignTicket(testTicket.getId(), testAssignee.getId());

            verify(ticketRepository).save(any(Ticket.class));
        }

        @Test
        @DisplayName("Not change status when ticket is not OPEN")
        void shouldNotChangeStatusWhenTicketIsNotOpen() {
            testTicket.setStatus(TicketStatus.CLOSED);

            when(ticketRepository.findById(any(UUID.class))).thenReturn(Optional.of(testTicket));
            when(userRepository.findById(any(UUID.class))).thenReturn(Optional.of(testAssignee));
            when(ticketRepository.save(any(Ticket.class))).thenAnswer(invocation -> {
                Ticket saved = invocation.getArgument(0);
                assertThat(saved.getStatus()).isEqualTo(TicketStatus.CLOSED);
                return saved;
            });
            when(ticketMapper.toDto(any(Ticket.class))).thenReturn(testTicketDTO);

            ticketService.assignTicket(testTicket.getId(), testAssignee.getId());
        }

        @Test
        @DisplayName("Throw exception when ticket not found")
        void shouldThrowExceptionWhenTicketNotFound() {
            when(ticketRepository.findById(any(UUID.class))).thenReturn(Optional.empty());

            assertThatThrownBy(() -> ticketService.assignTicket(UUID.randomUUID(), testAssignee.getId()))
                    .isInstanceOf(EntityNotFoundException.class);
        }

        @Test
        @DisplayName("Throw exception when assignee not found")
        void shouldThrowExceptionWhenAssigneeNotFound() {
            when(ticketRepository.findById(any(UUID.class))).thenReturn(Optional.of(testTicket));
            when(userRepository.findById(any(UUID.class))).thenReturn(Optional.empty());

            assertThatThrownBy(() -> ticketService.assignTicket(testTicket.getId(), UUID.randomUUID()))
                    .isInstanceOf(EntityNotFoundException.class);
        }
    }

    @Nested
    @DisplayName("Delete Ticket Tests")
    class DeleteTicketTests {
        @Test
        @DisplayName("Delete ticket successfully")
        void shouldDeleteTicket() {
            when(ticketRepository.existsById(any(UUID.class))).thenReturn(true);
            doNothing().when(ticketRepository).deleteById(any(UUID.class));

            assertThatCode(() -> ticketService.deleteTicket(testTicket.getId()))
                    .doesNotThrowAnyException();

            verify(ticketRepository).deleteById(testTicket.getId());
        }

        @Test
        @DisplayName("Throw exception when ticket not found")
        void shouldThrowExceptionWhenTicketNotFound() {
            when(ticketRepository.existsById(any(UUID.class))).thenReturn(false);

            assertThatThrownBy(() -> ticketService.deleteTicket(UUID.randomUUID()))
                    .isInstanceOf(EntityNotFoundException.class);

            verify(ticketRepository, never()).deleteById(any(UUID.class));
        }
    }
}