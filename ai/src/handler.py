import json
import os
from urllib.parse import unquote_plus

import boto3


s3 = boto3.client("s3", region_name=os.environ.get("AWS_REGION"))
bucket_name = os.environ.get("S3_BUCKET")


def _response(status_code: int, payload: dict) -> dict:
    return {
        "statusCode": status_code,
        "headers": {"Content-Type": "application/json"},
        "body": json.dumps(payload),
    }


def lambda_handler(event, _context):
    try:
        body = json.loads(event.get("body") or "{}")
    except json.JSONDecodeError:
        return _response(400, {"message": "Invalid JSON body"})

    source_key = body.get("sourceKey")
    output_key = body.get("outputKey")
    prompt = body.get("prompt")

    if not source_key or not output_key:
        return _response(400, {"message": "sourceKey and outputKey are required"})

    if not bucket_name:
        return _response(500, {"message": "S3_BUCKET is not configured"})

    s3.copy_object(
        Bucket=bucket_name,
        CopySource={"Bucket": bucket_name, "Key": unquote_plus(source_key)},
        Key=output_key,
        MetadataDirective="COPY",
    )

    return _response(
        200,
        {
            "outputKey": output_key,
            "prompt": prompt,
            "mode": "copy-through",
        },
    )
