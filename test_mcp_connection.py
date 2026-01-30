#!/usr/bin/env python3
"""
MCP Server 接続テストスクリプト
使い方: python test_mcp_connection.py
"""
import asyncio
import os
import sys
import socket

# .envファイルを読み込む
def load_dotenv_manual():
    """python-dotenvがなくても.envを読み込む"""
    env_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), '.env')
    if os.path.exists(env_file):
        with open(env_file) as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, value = line.split('=', 1)
                    value = value.strip('"').strip("'")
                    os.environ.setdefault(key, value)

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    load_dotenv_manual()


def check_env():
    """環境変数の確認"""
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
            display = value[:8] + "..." if len(value) > 8 else value
            print(f"  ✅ {var}: {display}")
        else:
            print(f"  ❌ {var}: 未設定")
            all_ok = False
    
    for var in optional_vars:
        value = os.environ.get(var)
        if value:
            print(f"  ✅ {var}: {value}")
        else:
            print(f"  ⚠️  {var}: 未設定 (デフォルト値使用)")
    
    return all_ok


def test_mcp_health():
    """MCPサーバーのヘルスチェック（ソケット接続テスト）"""
    print("\n" + "=" * 50)
    print("🏥 MCPサーバー ヘルスチェック")
    print("=" * 50)
    
    mcp_port = int(os.environ.get("MCP_SERVER_PORT", "9000"))
    
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(5)
        result = sock.connect_ex(('localhost', mcp_port))
        sock.close()
        
        if result == 0:
            print(f"  ✅ ポート {mcp_port} でMCPサーバーが起動中")
            return True
        else:
            print(f"  ❌ ポート {mcp_port} に接続できません")
            return False
    except Exception as e:
        print(f"  ❌ 接続テスト失敗: {e}")
        return False


async def test_mcp_tools_async():
    """MCPツール一覧の取得"""
    print("\n" + "=" * 50)
    print("🔧 MCPツール一覧")
    print("=" * 50)
    
    mcp_port = os.environ.get("MCP_SERVER_PORT", "9000")
    mcp_url = os.environ.get("EXTERNAL_MCP_URL", f"http://localhost:{mcp_port}/mcp")
    
    print(f"  ℹ️  MCP URL: {mcp_url}")
    
    # mcpパッケージを試す
    try:
        from mcp import ClientSession
        from mcp.client.streamable_http import streamablehttp_client
        
        async with streamablehttp_client(url=mcp_url) as (read_stream, write_stream, _):
            async with ClientSession(read_stream, write_stream) as session:
                await session.initialize()
                
                tools_result = await session.list_tools()
                tools = tools_result.tools
                
                print(f"\n  登録済みツール数: {len(tools)}")
                if len(tools) > 0:
                    print("\n  ツール一覧:")
                    for i, tool in enumerate(tools, 1):
                        print(f"    {i}. {tool.name}")
                else:
                    print("  ⚠️  ツールが登録されていません")
                
                return len(tools) > 0
                
    except ImportError:
        print("  ⚠️  mcp パッケージが未インストール")
        print("     pip install mcp でインストールしてください")
        # HTTPフォールバック
        return await test_mcp_tools_http_fallback(mcp_url)
    except Exception as e:
        print(f"  ❌ ツール取得失敗: {e}")
        return False


async def test_mcp_tools_http_fallback(mcp_url: str):
    """HTTPを使用したMCPツール取得（フォールバック）"""
    import urllib.request
    import json
    
    print("  ℹ️  HTTPフォールバックを使用")
    
    try:
        # initializeリクエスト
        init_data = json.dumps({
            "jsonrpc": "2.0",
            "id": 1,
            "method": "initialize",
            "params": {
                "protocolVersion": "2024-11-05",
                "capabilities": {},
                "clientInfo": {"name": "test", "version": "1.0"}
            }
        }).encode()
        
        req = urllib.request.Request(
            mcp_url,
            data=init_data,
            headers={
                "Content-Type": "application/json",
                "Accept": "application/json, text/event-stream",
            },
            method="POST"
        )
        
        with urllib.request.urlopen(req, timeout=10) as response:
            content = response.read().decode()
            print(f"  ✅ MCPサーバー応答あり")
            
            # tools/listリクエスト
            tools_data = json.dumps({
                "jsonrpc": "2.0",
                "id": 2,
                "method": "tools/list",
                "params": {}
            }).encode()
            
            req2 = urllib.request.Request(
                mcp_url,
                data=tools_data,
                headers={
                    "Content-Type": "application/json",
                    "Accept": "application/json, text/event-stream",
                },
                method="POST"
            )
            
            with urllib.request.urlopen(req2, timeout=10) as response2:
                content2 = response2.read().decode()
                
                # SSE形式からJSONを抽出
                for line in content2.split('\n'):
                    if line.startswith('data:'):
                        json_str = line[5:].strip()
                        if json_str:
                            try:
                                data = json.loads(json_str)
                                if "result" in data and "tools" in data["result"]:
                                    tools = data["result"]["tools"]
                                    print(f"\n  登録済みツール数: {len(tools)}")
                                    if len(tools) > 0:
                                        print("\n  ツール一覧:")
                                        for i, tool in enumerate(tools, 1):
                                            name = tool.get("name", "unknown")
                                            print(f"    {i}. {name}")
                                        return True
                                    else:
                                        print("  ⚠️  ツールが登録されていません")
                                        return False
                            except json.JSONDecodeError:
                                continue
                
                print(f"  ⚠️  ツール一覧を解析できませんでした")
                return False
                
    except Exception as e:
        print(f"  ❌ HTTPフォールバック失敗: {e}")
        return False


def test_mcp_tools():
    """MCPツール一覧の取得（非同期ラッパー）"""
    return asyncio.run(test_mcp_tools_async())


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
    
    print("\n" + "=" * 50)
    print("🧠 エージェント接続テスト")
    print("=" * 50)
    
    agent_endpoint = os.environ.get("AGENT_ENDPOINT", "http://localhost:8842")
    
    try:
        req = urllib.request.Request(f"{agent_endpoint}/health", method="GET")
        with urllib.request.urlopen(req, timeout=5) as response:
            print(f"  ✅ エージェント接続成功: {response.status}")
            return True
    except Exception as e:
        print(f"  ❌ エージェント接続失敗: {e}")
        return False


def main():
    print("\n🔬 MCP接続テスト開始\n")
    
    results = {
        "env": check_env(),
        "mcp_health": False,
        "mcp_tools": False,
        "datarobot": False,
        "agent": False,
    }
    
    try:
        results["mcp_health"] = test_mcp_health()
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
    
    return 0 if all(results.values()) else 1


if __name__ == "__main__":
    sys.exit(main())
