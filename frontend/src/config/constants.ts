export const THREAT_TYPES: Record<number, string> = {
    0: "Brute Force",
    1: "Lateral Movement",
    2: "Data Exfiltration",
    3: "C2 Beacon",
};

export const SEVERITY_LEVELS: Record<number, string> = {
    0: "Low",
    1: "Medium",
    2: "High",
    3: "Critical",
};

export const NODE_TYPES: Record<string, number> = {
    "dmz": 0,
    "app_server": 1,
    "db_server": 2,
    "workstation": 3,
};

export const RED_ACTIONS: Record<number, string> = {
    0: "Scan",
    1: "Exploit",
    2: "Lateral Move",
    3: "Exfiltrate",
    4: "Beacon",
    5: "Wait",
};

export const BLUE_ACTIONS: Record<number, string> = {
    0: "Monitor",
    1: "Isolate",
    2: "Patch",
    3: "Block IP",
    4: "Reset Creds",
    5: "Investigate",
};
