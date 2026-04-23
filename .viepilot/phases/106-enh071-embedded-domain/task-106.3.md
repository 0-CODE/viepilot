# Task 106.3 — brainstorm.md: 6 New Embedded Architect Workspace Pages

## Objective
Add 6 new HTML pages to the Architect workspace, triggered within Embedded Domain Mode. Each page has keyword triggers, Mermaid diagram type, a data table, and a corresponding notes.md YAML section. Covers ENH-071 Gaps 1 (hw-topology), 4 (pin-map), 5 (memory-layout), 8 (protocol-matrix) + RTOS scheduler and power budget pages.

## Status: pending

## Paths
workflows/brainstorm.md

## File-Level Plan

### `workflows/brainstorm.md` — Architect workspace page additions

Add 6 new page entries in the Architect Design Mode page-trigger table. Each follows the existing pattern (trigger keywords → create/update HTML page → update notes.md YAML → update hub `index.html` nav + `## Pages inventory`).

---

#### Page 1: `hw-topology.html` — Hardware Topology (ENH-071 Gap 1)
**Trigger**: `embedded_domain: true` (always when Architect mode active in embedded domain)
**Content**:
- Mermaid `graph TD` block diagram: MCU block (core, peripherals on-chip) connected to external ICs, sensors, actuators via labeled bus arrows
- Component table: Part / Type / Interface / Bus Speed / Notes
- Power rails diagram (simple table: 5V → LDO → 3.3V / VBAT)
**notes.md YAML**:
```yaml
## hw_topology
mcu:
  family: ""        # e.g. STM32F4, ESP32-S3
  core: ""          # e.g. Cortex-M4 @168MHz
  flash_kb: 0
  ram_kb: 0
peripherals: []     # on-chip peripherals used: [{ name, type, instance }]
external_ics: []    # [{ name, type, interface, bus_speed, notes }]
buses: []           # [{ type: SPI/I2C/UART/CAN, speed, devices: [] }]
power_rails: []     # [{ rail, source, voltage_v, max_ma }]
```

---

#### Page 2: `pin-map.html` — GPIO/Pin Assignment (ENH-071 Gap 4)
**Trigger**: `embedded_domain: true` AND pin/GPIO/pinout/assignment keywords OR hw-topology updated
**Content**:
- Pin assignment table: Pin# / GPIO Name / Alternate Function / Peripheral / Direction (IN/OUT/AF) / Pull (Up/Down/None) / Voltage Level / Notes
- Conflict detection note (two functions assigned to same pin)
**notes.md YAML**:
```yaml
## pin_map
pins: []   # [{ pin_num, gpio_name, function, peripheral, direction, pull, voltage_v, notes }]
conflicts: []   # auto-detected conflicts
```

---

#### Page 3: `memory-layout.html` — Memory Partitioning (ENH-071 Gap 5)
**Trigger**: `embedded_domain: true` AND flash/RAM/memory/linker/bootloader/OTA/partition keywords
**Content**:
- Flash regions table: Region / Start Address / Size / Usage / Notes
- RAM regions table: Region / Start Address / Size / Usage / Notes
- Linker constraint notes (stack size, heap size, section alignment)
- OTA slot layout if OTA mentioned
**notes.md YAML**:
```yaml
## memory_layout
flash_total_kb: 0
ram_total_kb: 0
flash_regions: []   # [{ name, start_hex, size_kb, usage, notes }]
ram_regions: []     # [{ name, start_hex, size_kb, usage, notes }]
linker_notes: ""
```

---

#### Page 4: `protocol-matrix.html` — Communication Protocol Matrix (ENH-071 Gap 8)
**Trigger**: CAN / I2C / SPI / UART / RS-485 / BLE / Wi-Fi / LoRa / LoRaWAN / MQTT / Modbus / CANopen / USB keywords (embedded domain context)
**Content**:
- Bus protocol table: Protocol / Role (master/slave/both) / Speed / Topology / Connected Devices / Notes
- External connectivity table: Protocol / Endpoint / Broker/Gateway / QoS / Notes
- Distinct from `apis.html` (HTTP REST) — embedded bus protocols only
**notes.md YAML**:
```yaml
## protocols
bus_protocols: []   # [{ name, role, speed, topology, devices: [], notes }]
wireless: []        # [{ protocol, role, endpoint, notes }]
```
**Note**: If user mentions HTTP/REST *in addition* (e.g. embedded → cloud gateway), both `apis.html` and `protocol-matrix.html` coexist.

---

#### Page 5: `rtos-scheduler.html` — RTOS & Task Scheduler (ENH-071 Gap 3 visual)
**Trigger**: RTOS / FreeRTOS / Zephyr / ThreadX / task / scheduler / semaphore / queue keywords (embedded domain)
**Content**:
- Task table: Task Name / Priority / Period or Event / Stack KB / State / Notes
- ISR table: Interrupt / Handler / Priority / Shared Resources / Notes
- Mermaid `stateDiagram-v2` for key task state transitions (optional, if ≤5 tasks)
**notes.md YAML**: shares `## rtos_config` from Task 106.1 (no new section — same YAML updated)

---

#### Page 6: `power-budget.html` — Power Budget (ENH-071 Gap 7 visual)
**Trigger**: battery / sleep / power / current / µA / mAh / Standby / Stop / Shutdown / LoRa / IoT keywords (embedded domain)
**Content**:
- Power modes table: Mode / MCU state / Active peripherals / Typical current (µA/mA) / Wake-up sources
- Battery life estimate table: Duty cycle → avg current → runtime formula
- Power rail summary (from hw-topology if available)
**notes.md YAML**: shares `## power_budget` from Task 106.1 (no new section — extended)

---

### Hub + Pages inventory updates
After each new page is created/updated:
- Add link to `index.html` nav (in Embedded section, separate from the standard 12 pages)
- Update `## Pages inventory` in notes.md

## Acceptance Criteria
- [ ] `hw-topology.html` created when embedded domain + Architect mode active
- [ ] `pin-map.html` created when GPIO/pin keywords appear in embedded domain
- [ ] `memory-layout.html` created when flash/RAM/memory keywords appear
- [ ] `protocol-matrix.html` created when bus protocol keywords appear (distinct from apis.html)
- [ ] `rtos-scheduler.html` created when RTOS/task keywords appear
- [ ] `power-budget.html` created when battery/power/sleep keywords appear
- [ ] All 6 pages linked in `index.html` under Embedded section
- [ ] `## Pages inventory` in notes.md updated for each page
- [ ] Each page has correct notes.md YAML section populated
