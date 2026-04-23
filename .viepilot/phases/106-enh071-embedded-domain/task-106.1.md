# Task 106.1 — brainstorm.md: Domain Detection + Embedded Topic Probes

## Objective
Add Embedded Domain Mode detection and embedded-specific topic probes to `workflows/brainstorm.md`. Covers ENH-071 Gaps 2 (MCU/toolchain), 3 (RTOS/scheduling), 7 (power budget), 9 (firmware phase template), 10 (safety/compliance).

## Status: done

## Paths
workflows/brainstorm.md

## File-Level Plan

### `workflows/brainstorm.md`

#### A — Domain Detection (new `<domain_detection>` subsection in Step 0 / initialization)
Insert after session language config read. Add:

```
## Embedded Domain Detection (ENH-071)

Scan session input and prior turns for embedded trigger keywords.

**Trigger keywords** (MCU families + concepts):
- MCU: STM32, ESP32, nRF52, nRF5, AVR, PIC, RISC-V, Cortex-M, RP2040, MSP430, SAM
- Concepts: firmware, bare-metal, microcontroller, embedded, GPIO, interrupt, HAL,
  bootloader, RTOS, FreeRTOS, Zephyr, ThreadX, ChibiOS, linker, flash memory,
  peripheral, UART, SPI, I2C, CAN, watchdog

**Activation rule**: ≥2 keyword matches → set `embedded_domain: true`
**Manual override**: `--domain embedded` flag → set `embedded_domain: true` unconditionally

**On activation (one-time banner)**:
> 🔌 Embedded Domain Mode activated — hardware topology, pin map, memory layout,
> RTOS, and protocol pages will be added to the Architect workspace.
> UI Direction web-UI suggestions suppressed (use hardware display pages instead).
```

#### B — MCU/Toolchain Topic Probe (new sub-topic in tech-stack section)
When `embedded_domain: true`, after the general tech-stack questions, add:

```
### Embedded Toolchain Sub-Topic (ENH-071 Gap 2)
1. MCU/SoC: Which family? (STM32 / ESP32 / nRF52 / RISC-V / AVR / other)
2. Toolchain: GCC-ARM / Clang / IAR Embedded Workbench / Keil MDK / other
3. Build system: CMake / Make / PlatformIO / West (Zephyr) / other
4. Debug interface: SWD / JTAG / UART-bootloader / ESP ROM bootloader
5. Flasher/debugger: OpenOCD / J-Link / ST-Link / Black Magic Probe / esptool / other
6. SDK/HAL: STM32 HAL+LL / ESP-IDF / nRF5 SDK / Zephyr west / Arduino framework

→ Store in notes.md ## embedded_toolchain YAML section
```

#### C — RTOS/Scheduling Topic (new brainstorm topic)
When `embedded_domain: true`, add topic after architecture/components:

```
### RTOS & Scheduling Topic (ENH-071 Gap 3)
1. Execution model: bare-metal (super-loop) / bare-metal (interrupt-driven) / RTOS?
2. If RTOS: FreeRTOS / Zephyr / ThreadX (Azure) / RT-Thread / ChibiOS / other
3. Tasks/threads needed (name, period or event-driven, priority 1–10, estimated stack KB)
4. ISR table: interrupt source, handler function, priority (0 = highest)
5. Shared resource protection: mutex / semaphore / critical section / taskENTER_CRITICAL
6. Timing requirements: any hard real-time constraints (response time in µs/ms)?

→ Store in notes.md ## rtos_config YAML section
```

#### D — Power Budget Topic (new brainstorm topic, conditional)
Trigger when battery/sleep/power/current/µA/mAh/IoT/LoRa keywords appear OR `embedded_domain: true` + user mentions power:

```
### Power Budget Topic (ENH-071 Gap 7)
1. Power supply: battery (type, capacity mAh) / USB / DC adapter / energy harvesting
2. Active mode target: max average current (mA)
3. Sleep strategy: which MCU sleep mode (Stop / Standby / Shutdown / Hibernate)
4. Peripherals during sleep: which stay on (RTC / LoRa / BLE / ADC)?
5. Wake-up sources: RTC timer / GPIO interrupt / UART / WDT
6. Target battery lifetime (days/months)?

→ Store in notes.md ## power_budget YAML section
```

#### E — Safety/Compliance Topic (conditional, keyword-gated)
Trigger when: safety / watchdog / fault / SIL / ASIL / IEC / ISO 26262 / DO-178 keywords appear:

```
### Safety & Compliance Topic (ENH-071 Gap 10)
1. Safety standard: IEC 61508 (SIL 1–4) / ISO 26262 (ASIL A–D) / DO-178C / EN 50128 / none
2. Watchdog: IWDG / WWDG / timeout value / pet strategy
3. Stack overflow detection: MPU / FreeRTOS stack check / canary / none
4. Fault handler strategy: HardFault / MemManage / BusFault → reset / safe state / log
5. Safe state definition: what is the safe fallback when error detected?
6. Diagnostic coverage requirements?

→ Store in notes.md ## safety_config YAML section
```

#### F — Firmware Phase Template (Gap 9)
When `embedded_domain: true`, in Phase assignment step, offer template:

```
### Firmware Phase Ordering Template (ENH-071 Gap 9)
Suggest to user:

Phase 1: Board Bring-Up (clock config, GPIO init, UART console, LED blink, JTAG verify)
Phase 2: Driver Layer (all peripheral drivers from hw-topology: SPI, I2C, UART, ADC, etc.)
Phase 3: RTOS Configuration (task creation, queues, semaphores, heap sizing)
Phase 4: Middleware & Protocols (MQTT/BLE/LoRa stack, filesystem, OTA bootloader)
Phase 5: Application Logic (state machines, business logic, data processing)
Phase 6: Integration & System Test (hardware-in-the-loop, timing verification, stress test)
Phase 7: OTA & Production (bootloader signing, provisioning flow, factory test jig)

User can remove/merge phases. Template stored in ## phases YAML with `domain: embedded` tag.
```

## Acceptance Criteria
- [ ] `embedded_domain` flag set correctly by keyword detection (≥2 triggers)
- [ ] `--domain embedded` forces activation
- [ ] One-time activation banner emitted
- [ ] MCU/toolchain probe questions injected when embedded_domain active
- [ ] RTOS topic probe injected when embedded_domain active
- [ ] Power budget topic triggered by relevant keywords
- [ ] Safety topic triggered by safety-related keywords
- [ ] Firmware phase template offered when embedded_domain active
- [ ] All 5 notes.md YAML sections (`embedded_toolchain`, `rtos_config`, `power_budget`, `safety_config`, `phases` with domain tag) stored correctly
