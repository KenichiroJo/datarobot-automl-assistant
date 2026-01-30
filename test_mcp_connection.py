#!/usr/bin/env python3
"""
MCP Server 接続テストスクリプト
使い方: python test_mcp_connection.py
"""
import asyncio
import os
import sys

# 環境変数の確認
def check_env():
    print("=" * 50)
    print("🔍 環境変数チェック")
    print("=" * 50)
    
    required_vars = [
        "DATAROBOT_API_TOKEN",
        "DATAROBOT_ENDPOINT",
    ]
    
    optional_vars = [
        "MCP_SERVER_PORT",
        "EXTERNAL_MCP_URL",
    ]
    
    all_ok = True
    for var in required_vars:
        value = os.environ.get(var)
        if value:
            # トークンは最初の8文字のみ表示
            display = value[:8] + "..." if len(value) > 8 else value
            print(f"  ✅ {var}: {display}")
        else:
            print(f"  ❌ {var}: 未設定")
            all_ok = False
    
    for var in optional_vars:
        value = os.environ.get(var)
        if value:
            print(f"  ℹ️  {var}: {value}")
        else:
            print(f"  ⚠️  {var}: 未設定 (デフォルト値使用)")
    
    return all_ok


def test_mcp_health():
    """MCPサーバーのヘルスチェック"""
    import urllib.request
    import json
    
    print("\n" + "=" * 50)
    print("🏥 MCPサーバー ヘルスチェック")
    print("=" * 50)
    
    mcp_port = os.environ.get("MCP_SERVER_PORT", "9000")
    mcp_url = f"http://localhost:{mcp_port}"
    
    endpoints = [
        "/health",
        "/mcp",
        "/docs",
    ]
    
    for endpoint in endpoints:
        url = mcp_url + endpoint
        try:
            req = urllib.request.Request(url, method="GET")
            with urllib.request.urlopen(req, timeout=5) as response:
                print(f"  ✅ {endpoint}: {response.status} OK")
        except urllib.error.HTTPError as e:
            print(f"  ⚠️  {endpoint}: HTTP {e.code}")
        except Exception as e:
            print(f"  ❌ {endpoint}: 接続失敗 - {e}")


def test_mcp_tools():
    """MCPツール一覧の取得"""
    import urllib.request
    import json
    
    print("\n" + "=" * 50)
    print("🔧 MCPツール一覧")
    print("=" * 50)
    
    mcp_port = os.environ.get("MCP_SERVER_PORT", "9000")
    mcp_url = f"http://localhost:{mcp_port}/mcp"
    
    try:
        # MCP tools/list リクエスト
        data = json.dumps({
            "jsonrpc": "2.0",
            "id": 1,
            "method": "tools/list",
            "params": {}
        }).encode()
        
        req = urllib.request.Request(
            mcp_url,
            data=data,
            headers={"Content-Type": "application/json"},
            method="POST"
        )
        
        with urllib.request.urlopen(req, timeout=10) as response:
            result = json.loads(response.read().decode())
            
            if "result" in result and "tools" in result["result"]:
                tools = result["result"]["tools"]
                print(f"\n  登録済みツール数: {len(tools)}")
                print("\n  ツール一覧:")
                for tool in tools:
                    name = tool.get("name", "unknown")
                    desc = tool.get("description", "")[:50]
                    print(f"    • {name}")
                return True
            else:
                print(f"  ⚠️  予期しないレスポンス: {result}")
                return False
                
    except Exception as e:
        print(f"  ❌ ツール取得失敗: {e}")
        return False


def test_datarobot_connection():
    """DataRobot API接続テスト"""
    import urllib.request
    import json
    
    print("\n" + "=" * 50)
    print("🤖 DataRobot API接続テスト")
    print("=" * 50)
    
    token = os.environ.get("DATAROBOT_API_TOKEN")
    endpoint = os.environ.get("DATAROBOT_ENDPOINT", "https://app.datarobot.com/api/v2")
    
    if not token:
        print("  ❌ DATAROBOT_API_TOKEN が設定されていません")
        return False
    
    try:
        # /projects エンドポイントをテスト
        url = f"{endpoint}/projects/?limit=1"
        req = urllib.request.Request(
            url,
            headers={
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json",
            },
            method="GET"
        )
        
        with urllib.request.urlopen(req, timeout=10) as response:
            result = json.loads(response.read().decode())
            print(f"  ✅ DataRobot API接続成功")
            print(f"  ℹ️  プロジェクト数: {len(result)} 件取得")
            return True
            
    except urllib.error.HTTPError as e:
        print(f"  ❌ DataRobot API エラー: HTTP {e.code}")
        if e.code == 401:
            print("     → トークンが無効または期限切れです")
        return False
    except Exception as e:
        print(f"  ❌ DataRobot API接続失敗: {e}")
        return False


def test_agent_connection():
    """エージェント接続テスト"""
    import urllib.request
    import json
    
    print("\n" + "=" * 50)
    print("🧠 エージェント接続テスト")
    print("=" * 50)
    
    agent_port = os.environ.get("AGENT_PORT", "8842")
    agent_url = f"http://localhost:{agent_port}"
    
    try:
        req = urllib.request.Request(f"{agent_url}/health", method="GET")
        with urllib.request.urlopen(req, timeout=5) as response:
            print(f"  ✅ エージェント接続成功: {response.status}")
            return True
    except Exception as e:
        print(f"  ❌ エージェント接続失敗: {e}")
        return False


def main():
    print("\n" + "🔬 MCP接続テスト開始" + "\n")
    
    results = {
        "env": check_env(),
        "mcp_health": False,
        "mcp_tools": False,
        "datarobot": False,
        "agent": False,
    }
    
    try:
        test_mcp_health()
        results["mcp_health"] = True
    except Exception as e:
        print(f"  ❌ MCPヘルスチェック失敗: {e}")
    
    try:
        results["mcp_tools"] = test_mcp_tools()
    except Exception as e:
        print(f"  ❌ MCPツールテスト失敗: {e}")
    
    try:
        results["datarobot"] = test_datarobot_connection()
    except Exception as e:
        print(f"  ❌ DataRobot接続テスト失敗: {e}")
    
    try:
        results["agent"] = test_agent_connection()
    except Exception as e:
        print(f"  ❌ エージェント接続テスト失敗: {e}")
    
    # サマリー
    print("\n" + "=" * 50)
    print("📊 テスト結果サマリー")
    print("=" * 50)
    
    status_map = {
        "env": "環境変数",
        "mcp_health": "MCPサーバー",
        "mcp_tools": "MCPツール",
        "datarobot": "DataRobot API",
        "agent": "エージェント",
    }
    
    for key, name in status_map.items():
        status = "✅" if results[key] else "❌"
        print(f"  {status} {name}")
    
    print("\n")
    
    # 全て成功なら0、そうでなければ1を返す
    return 0 if all(results.values()) else 1


if __name__ == "__main__":
    sys.exit(main())
