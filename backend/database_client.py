"""
Direct PostgreSQL client for Supabase
Alternative to the Supabase Python SDK
"""

import os
import httpx
from typing import Dict, List, Any, Optional

class SupabaseClient:
    """Simple HTTP client for Supabase REST API"""
    
    def __init__(self, url: str, key: str):
        self.url = url.rstrip('/')
        self.key = key
        self.rest_url = f"{self.url}/rest/v1"
        self.headers = {
            "apikey": self.key,
            "Authorization": f"Bearer {self.key}",
            "Content-Type": "application/json",
            "Prefer": "return=representation"
        }
    
    def table(self, table_name: str):
        """Get table interface"""
        return TableClient(self.rest_url, table_name, self.headers)
    
    def rpc(self, function_name: str, params: Dict = None):
        """Call a PostgreSQL function"""
        url = f"{self.rest_url}/rpc/{function_name}"
        with httpx.Client() as client:
            response = client.post(url, json=params or {}, headers=self.headers)
            response.raise_for_status()
            return Response(response.json())

class TableClient:
    """Table operations client"""
    
    def __init__(self, base_url: str, table_name: str, headers: Dict):
        self.base_url = base_url
        self.table_name = table_name
        self.headers = headers
        self.url = f"{base_url}/{table_name}"
        self._filters = []
        self._select_fields = "*"
        self._order_by = None
        self._limit_value = None
    
    def select(self, fields: str = "*", count: str = None):
        """Select fields"""
        self._select_fields = fields
        if count:
            self.headers["Prefer"] = f"count={count}"
        return self
    
    def eq(self, column: str, value: Any):
        """Equal filter"""
        self._filters.append(f"{column}=eq.{value}")
        return self
    
    def order(self, column: str, desc: bool = False):
        """Order by"""
        direction = "desc" if desc else "asc"
        self._order_by = f"{column}.{direction}"
        return self
    
    def limit(self, count: int):
        """Limit results"""
        self._limit_value = count
        return self
    
    def single(self):
        """Get single result"""
        self._limit_value = 1
        result = self.execute()
        if result.data and len(result.data) > 0:
            result.data = result.data[0]
        return result
    
    def execute(self):
        """Execute the query"""
        params = {}
        if self._select_fields:
            params["select"] = self._select_fields
        if self._filters:
            for filter_str in self._filters:
                key, value = filter_str.split("=", 1)
                params[key] = value
        if self._order_by:
            params["order"] = self._order_by
        if self._limit_value:
            params["limit"] = self._limit_value
        
        with httpx.Client() as client:
            response = client.get(self.url, params=params, headers=self.headers)
            response.raise_for_status()
            
            # Get count if requested
            count = None
            if "count" in self.headers.get("Prefer", ""):
                count_header = response.headers.get("Content-Range", "")
                if "/" in count_header:
                    count = int(count_header.split("/")[1])
            
            return Response(response.json(), count)
    
    def insert(self, data: Dict):
        """Insert data"""
        with httpx.Client() as client:
            response = client.post(self.url, json=data, headers=self.headers)
            response.raise_for_status()
            return Response(response.json())
    
    def update(self, data: Dict):
        """Update data"""
        params = {}
        for filter_str in self._filters:
            key, value = filter_str.split("=", 1)
            params[key] = value
        
        with httpx.Client() as client:
            response = client.patch(self.url, json=data, params=params, headers=self.headers)
            response.raise_for_status()
            return Response(response.json())
    
    def delete(self):
        """Delete data"""
        params = {}
        for filter_str in self._filters:
            key, value = filter_str.split("=", 1)
            params[key] = value
        
        with httpx.Client() as client:
            response = client.delete(self.url, params=params, headers=self.headers)
            response.raise_for_status()
            return Response(response.json())

class Response:
    """Response wrapper"""
    
    def __init__(self, data: Any, count: Optional[int] = None):
        self.data = data
        self.count = count

def create_client(url: str, key: str) -> SupabaseClient:
    """Create Supabase client"""
    return SupabaseClient(url, key)
