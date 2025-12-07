package com.gnomeshift.tisk;

import com.gnomeshift.tisk.ticket.*;
import com.gnomeshift.tisk.user.*;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
@ConditionalOnProperty(name = "app.seed-demo-data", havingValue = "true")
public class DataSeeder implements CommandLineRunner {
    private final UserRepository userRepository;
    private final TicketRepository ticketRepository;
    private final PasswordEncoder passwordEncoder;
    private final EntityManager entityManager;

    @Value("${app.seed-demo-data.force:false}")
    private boolean forceSeed;

    @Transactional
    public void run(String... args) {
        if (!forceSeed && (userRepository.count() > 0 || ticketRepository.count() > 0)) {
            log.info("Database isn't empty, skipping seeding. Set 'APP_SEED_DEMO_DATA_FORCE=true' to override");
            return;
        }

        if (forceSeed) {
            log.warn("Force seeding enabled, clearing database...");
            clearAllData();
        }

        log.info("Starting data seeding...");

        List<User> users = createUsers();
        List<Ticket> tickets = createTickets(users);

        log.info("Data seeding completed! Created {} users and {} tickets", users.size(), tickets.size());
    }

    private void clearAllData() {
        ticketRepository.deleteAllInBatch();
        userRepository.deleteAllInBatch();
        entityManager.flush();
        entityManager.clear();

        log.info("All existing data cleared");
    }

    private List<User> createUsers() {
        List<User> users = userRepository.saveAllAndFlush(List.of(
                User.builder()
                        .email("admin@example.com")
                        .password(passwordEncoder.encode("Admin123"))
                        .firstName("Александр")
                        .lastName("Админов")
                        .login("admin")
                        .role(UserRole.ADMIN)
                        .status(UserStatus.ACTIVE)
                        .department("Отдел администрирования")
                        .position("Системный администратор")
                        .phoneNumber("+79001234567")
                        .build(),

                User.builder()
                        .email("support@example.com")
                        .password(passwordEncoder.encode("Support123"))
                        .firstName("Мария")
                        .lastName("Поддержкина")
                        .login("support")
                        .role(UserRole.SUPPORT)
                        .status(UserStatus.ACTIVE)
                        .department("Отдел поддержки")
                        .position("Оператор")
                        .phoneNumber("+79002345678")
                        .build(),

                User.builder()
                        .email("support2@example.com")
                        .password(passwordEncoder.encode("Support123"))
                        .firstName("Иван")
                        .lastName("Помощников")
                        .login("support2")
                        .role(UserRole.SUPPORT)
                        .status(UserStatus.ACTIVE)
                        .department("Отдел поддержки")
                        .position("Старший специалист")
                        .build(),

                User.builder()
                        .email("user@example.com")
                        .password(passwordEncoder.encode("User123"))
                        .firstName("Петр")
                        .lastName("Петров")
                        .login("petr_petrov")
                        .role(UserRole.USER)
                        .status(UserStatus.ACTIVE)
                        .department("Служба экономики и финансов")
                        .position("Экономист")
                        .phoneNumber("+79003456789")
                        .build(),

                User.builder()
                        .email("user2@example.com")
                        .password(passwordEncoder.encode("User123"))
                        .firstName("Анна")
                        .lastName("Сидорова")
                        .login("anna_sidorova")
                        .role(UserRole.USER)
                        .status(UserStatus.ACTIVE)
                        .department("Отдел по работе с клиентами")
                        .position("Старший специалист")
                        .build(),

                User.builder()
                        .email("user3@example.com")
                        .password(passwordEncoder.encode("User123"))
                        .firstName("Дмитрий")
                        .lastName("Баранов")
                        .login("dmitry_baranov")
                        .role(UserRole.USER)
                        .status(UserStatus.INACTIVE)
                        .department("Хозяйственный отдел")
                        .position("Завхоз")
                        .build()));

        log.info("Created {} users", users.size());
        return users;
    }

    private List<Ticket> createTickets(List<User> users) {
        User admin = users.get(0);
        User support1 = users.get(1);
        User support2 = users.get(2);
        User user1 = users.get(3);
        User user2 = users.get(4);
        User user3 = users.get(5);

        List<Ticket> tickets = ticketRepository.saveAllAndFlush(List.of(
                Ticket.builder()
                        .title("Не могу войти в систему")
                        .description("При попытке входа появляется ошибка \"Неверный пароль\". Уверен, что пароль правильный.")
                        .status(TicketStatus.OPEN)
                        .priority(TicketPriority.HIGH)
                        .reporter(user1)
                        .assignee(null)
                        .build(),

                Ticket.builder()
                        .title("Запрос на добавление темной темы")
                        .description("Было бы здорово иметь возможность переключиться на темную тему. Работаю допоздна и глаза к вечеру устают.")
                        .status(TicketStatus.OPEN)
                        .priority(TicketPriority.LOW)
                        .reporter(user2)
                        .assignee(null)
                        .build(),

                Ticket.builder()
                        .title("Ошибка при загрузке файлов больше 10 МБ в 1C")
                        .description("При попытке загрузить файл размером более 10 МБ он не загружается!")
                        .status(TicketStatus.OPEN)
                        .priority(TicketPriority.VERY_HIGH)
                        .reporter(user1)
                        .assignee(null)
                        .build(),

                Ticket.builder()
                        .title("Не могу экспортировать в данные в Excel")
                        .description("При экспорте данных в Excel получаю ошибку \"Недостаточно прав\".")
                        .status(TicketStatus.IN_PROGRESS)
                        .priority(TicketPriority.VERY_HIGH)
                        .reporter(user1)
                        .assignee(support1)
                        .build(),

                Ticket.builder()
                        .title("Нужен доступ к отчетам")
                        .description("Прошу предоставить доступ к модулю отчетов до конца недели.")
                        .status(TicketStatus.IN_PROGRESS)
                        .priority(TicketPriority.MEDIUM)
                        .reporter(user2)
                        .assignee(admin)
                        .build(),

                Ticket.builder()
                        .title("Медленная работа интернета в утренние часы")
                        .description("Каждый день с 9 до 10 интернет работает очень медленно")
                        .status(TicketStatus.IN_PROGRESS)
                        .priority(TicketPriority.HIGH)
                        .reporter(user3)
                        .assignee(support2)
                        .build(),

                Ticket.builder()
                        .title("Не работает кнопка \"Сохранить\"")
                        .description("В форме редактирования профиля клиента кнопка не реагирует на нажатия.")
                        .status(TicketStatus.CLOSED)
                        .priority(TicketPriority.HIGH)
                        .reporter(user2)
                        .assignee(support1)
                        .build(),

                Ticket.builder()
                        .title("Нет обоев на компьютере")
                        .description("На рабочем столе вместо обоев стал черный экран.")
                        .status(TicketStatus.CLOSED)
                        .priority(TicketPriority.LOW)
                        .reporter(user1)
                        .assignee(support1)
                        .build(),

                Ticket.builder()
                        .title("Письмо для восстановления пароля не приходит на email")
                        .description("Пытаюсь восстановить пароль, но письмо не приходит. В папке 'Спам' тоже нет.")
                        .status(TicketStatus.CLOSED)
                        .priority(TicketPriority.MEDIUM)
                        .reporter(user3)
                        .assignee(support1)
                        .build(),

                Ticket.builder()
                        .title("Неправильно отображается дата в отчете")
                        .description("В форме просмотра отчета дата отображается в формате ММ/ДД/ГГГГ вместо ДД.ММ.ГГГГ")
                        .status(TicketStatus.CLOSED)
                        .priority(TicketPriority.MEDIUM)
                        .reporter(user2)
                        .assignee(admin)
                        .build()
        ));

        log.info("Created {} tickets", tickets.size());
        return tickets;
    }
}
