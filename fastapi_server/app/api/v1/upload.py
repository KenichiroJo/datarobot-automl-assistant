# Copyright 2025 DataRobot, Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#   http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
"""
DataRobot AI Catalog Upload API
ファイルをDataRobot AI Catalogにアップロードするためのエンドポイント
"""
import logging
import os
import tempfile
from typing import Optional

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from pydantic import BaseModel

logger = logging.getLogger(__name__)
upload_router = APIRouter(tags=["Upload"])


class UploadResponse(BaseModel):
    success: bool
    dataset_id: Optional[str] = None
    dataset_name: Optional[str] = None
    rows: Optional[int] = None
    columns: Optional[int] = None
    message: str


class DatasetListResponse(BaseModel):
    datasets: list[dict]
    total: int


@upload_router.post("/upload/dataset", response_model=UploadResponse)
async def upload_dataset_to_ai_catalog(
    file: UploadFile = File(...),
    use_case_id: Optional[str] = Form(None),
) -> UploadResponse:
    """
    ファイルをDataRobot AI Catalogにアップロードする
    
    Args:
        file: アップロードするファイル（CSV, Excel等）
        use_case_id: DataRobotのUse Case ID（オプション）
    
    Returns:
        アップロード結果（dataset_id, 行数、列数など）
    """
    try:
        import datarobot as dr
        
        # DataRobot クライアント初期化
        api_token = os.environ.get("DATAROBOT_API_TOKEN")
        endpoint = os.environ.get("DATAROBOT_ENDPOINT", "https://app.datarobot.com/api/v2")
        
        if not api_token:
            raise HTTPException(status_code=500, detail="DATAROBOT_API_TOKEN is not set")
        
        dr.Client(token=api_token, endpoint=endpoint)
        logger.info(f"DataRobot client initialized with endpoint: {endpoint}")
        
        # ファイルを一時保存
        with tempfile.NamedTemporaryFile(delete=False, suffix=f"_{file.filename}") as tmp:
            content = await file.read()
            tmp.write(content)
            tmp_path = tmp.name
        
        logger.info(f"Uploading file: {file.filename} ({len(content)} bytes)")
        
        try:
            # Use Case IDを取得
            uc_id = use_case_id or os.environ.get("DATAROBOT_DEFAULT_USE_CASE")
            
            # AI Catalogにアップロード
            dataset = dr.Dataset.create_from_file(
                file_path=tmp_path,
                use_cases=[uc_id] if uc_id else None,
            )
            
            logger.info(f"Dataset created: {dataset.id}")
            
            # データセット情報を取得
            return UploadResponse(
                success=True,
                dataset_id=dataset.id,
                dataset_name=dataset.name,
                rows=getattr(dataset, 'row_count', None),
                columns=getattr(dataset, 'column_count', None),
                message=f"Successfully uploaded {file.filename} to AI Catalog",
            )
            
        finally:
            # 一時ファイルを削除
            if os.path.exists(tmp_path):
                os.unlink(tmp_path)
                
    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"Failed to upload dataset: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@upload_router.get("/upload/datasets", response_model=DatasetListResponse)
async def list_ai_catalog_datasets(
    limit: int = 20,
    offset: int = 0,
) -> DatasetListResponse:
    """
    AI Catalogのデータセット一覧を取得
    """
    try:
        import datarobot as dr
        
        api_token = os.environ.get("DATAROBOT_API_TOKEN")
        endpoint = os.environ.get("DATAROBOT_ENDPOINT", "https://app.datarobot.com/api/v2")
        
        if not api_token:
            raise HTTPException(status_code=500, detail="DATAROBOT_API_TOKEN is not set")
        
        dr.Client(token=api_token, endpoint=endpoint)
        
        # データセット一覧を取得
        datasets = dr.Dataset.list()
        
        result = []
        for ds in list(datasets)[offset:offset + limit]:
            result.append({
                "id": ds.id,
                "name": ds.name,
                "created_at": str(getattr(ds, 'created_at', '')),
                "row_count": getattr(ds, 'row_count', None),
                "column_count": getattr(ds, 'column_count', None),
            })
        
        return DatasetListResponse(
            datasets=result,
            total=len(list(datasets)),
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"Failed to list datasets: {e}")
        raise HTTPException(status_code=500, detail=str(e))
