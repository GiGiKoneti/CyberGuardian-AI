import uuid
import time
from typing import Dict

class LogGenerator:
    def _create_base_log(self, type_str: str) -> Dict:
        return {
            "id": str(uuid.uuid4()),
            "timestamp": int(time.time()),
            "type": type_str,
        }

    def generate_scan_log(self, source: int, target: int, result: float) -> Dict:
        log = self._create_base_log("scan")
        log.update({"source": source, "target": target, "metadata": {"vulnerability": result}})
        return log

    def generate_exploit_log(self, source: int, target: int, success: bool) -> Dict:
        log = self._create_base_log("exploit")
        log.update({"source": source, "target": target, "success": success})
        return log

    def generate_lateral_movement_log(self, source: int, destination: int) -> Dict:
        log = self._create_base_log("lateral_movement")
        log.update({"source": source, "destination": destination})
        return log

    def generate_exfiltration_log(self, source: int, bytes_transferred: float) -> Dict:
        log = self._create_base_log("exfiltration")
        log.update({"source": source, "metadata": {"bytes": bytes_transferred}})
        return log

    def generate_beacon_log(self, source: int) -> Dict:
        log = self._create_base_log("beacon")
        log.update({"source": source})
        return log
