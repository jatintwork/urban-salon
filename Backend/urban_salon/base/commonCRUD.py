# ALL EXCEPTIONS
from django.core.exceptions import *  # Django Exception Classes
from django.db import *  # Django Database Exceptions
from django.urls import *  # Django URL Resolver Exceptions
from django.http import *  # Django Http Exceptions

# REST FRAMEWORK IMPORTS
from rest_framework import status
from rest_framework.response import Response
import logging
import traceback

# Get the logger instance
logger = logging.getLogger('direct_import')

def requestGetSingleRecord(request, model_name, serializer_name):
    """
    Handle GET request to retrieve a single or filtered set of records of a model.
    Filters out records marked as deleted and orders by created date in descending order.
    The request may contain filter criteria.
    """
    try:
        # Fetch query parameters for filtering, if any
        filters = request.GET.dict()

        # Include delete_flag as False in the filters to exclude soft-deleted records
        filters['delete_flag'] = False

        # Fetch filtered records with delete_flag set to False and ordered by created_date
        all_records = model_name.objects.filter(**filters).order_by('-created_date')

        # Check if records exist, if not return 404 response
        if not all_records.exists():
            return Response({"detail": "No records found."}, status=status.HTTP_404_NOT_FOUND)

        # Serialize the retrieved records (many=True since it's a list of records)
        serialized_records_all = serializer_name(all_records, many=True)
        
        # Log the executed query
        logger.info(all_records.query)
        
        # Return serialized data with HTTP 200 OK
        return Response(serialized_records_all.data, status=status.HTTP_200_OK)
    
    except Exception as e:
        # Log any exceptions that occur
        logger.error(f"{model_name} GETALL - {e}")
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)



def requestGetAll(model_name, serializer_name):
    """
    Handle GET request to retrieve all records of a model.
    Filters out records marked as deleted and orders by created date in descending order.
    """
    try:
        # Fetch all records with delete_flag set to False and order by created_date
        all_records = model_name.objects.filter(delete_flag=False).order_by('-created_date')

        # Serialize the retrieved records
        serialized_records_all = serializer_name(all_records, many=True)
        
        # Log the executed query
        logger.info(all_records.query)
        
        # Return serialized data with HTTP 200 OK
        return Response(serialized_records_all.data, status=status.HTTP_200_OK)
    except Exception as e:
        # Log any exceptions that occur
        logger.error(f"{model_name} GETALL - {e}")
        return Response([], status=status.HTTP_400_BAD_REQUEST)


def requestCreate(request, serializer_name):
    """
    Handle POST request to create a new record.
    Validates and saves the serialized data if valid.
    """
    if request.method == "POST" and request.data:
        try:
            # Serialize the request data
            serialized_request_create = serializer_name(data=request.data)

            # Validate the serialized data
            if serialized_request_create.is_valid():
                # Save the record if valid
                serialized_request_create.save()
                return Response("Record created successfully!", status=status.HTTP_201_CREATED)
            else:
                # Return validation errors with HTTP 400 Bad Request
                return Response(serialized_request_create.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            # Log any exceptions that occur
            logger.error(f"RECORD CREATE - {e}")
            return Response(serialized_request_create.errors, status=status.HTTP_400_BAD_REQUEST)
    return Response({"error": "No data provided"}, status=status.HTTP_400_BAD_REQUEST)


def requestModify(request, model_name, serializer_name):
    """
    Handle PUT request to modify an existing record.
    Validates and updates the record if it exists.
    """
    if request.method == "PUT" and request.data:
        try:
            # Fetch the record by primary key (id)
            request_update = model_name.objects.get(pk=request.data.get("id"))

            # Serialize the data with partial update
            serialized_request_update = serializer_name(instance=request_update, data=request.data, partial=True)

            if serialized_request_update.is_valid():
                # Save the updated record if valid
                serialized_request_update.save()
                return Response("Data updated successfully", status=status.HTTP_201_CREATED)
            else:
                # Return validation errors with HTTP 400 Bad Request
                return Response(serialized_request_update.errors, status=status.HTTP_400_BAD_REQUEST)
        except ObjectDoesNotExist:
            # Return 404 if the record does not exist
            return Response("Data doesn't exist with this id", status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            # Log any other exceptions that occur
            logger.error(f"RECORD UPDATE - {e}")
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
    return Response({"error": "Id is required"}, status=status.HTTP_400_BAD_REQUEST)


def requestDelete(request, model_name):
    """
    Handle DELETE request to mark a record as deleted.
    Sets the delete_flag to True instead of actually deleting the record.
    """
    if request.method == "DELETE" and request.data:
        try:
            # Fetch the record by primary key (id)
            request_delete = model_name.objects.get(pk=request.data.get("id"))
           
            # Mark the record as deleted
            request_delete.delete_flag = True
            request_delete.save()
            return Response(status=status.HTTP_200_OK)
        except ObjectDoesNotExist:
            # Return 404 if the record does not exist
            return Response("Data doesn't exist with this id", status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            # Log any other exceptions that occur
            logger.error(f"RECORD DELETE - {e}")
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
    return Response({"error": "Id is required"}, status=status.HTTP_400_BAD_REQUEST)


def requestHardDelete(request, model_name):
    """
    Handle DELETE request to mark a record as deleted.
    Sets the delete_flag to True instead of actually deleting the record.
    """
    if request.method == "DELETE" and request.data:
        try:
            # Fetch the record by primary key (id)
            request_delete = model_name.objects.get(pk=request.data.get("id"))
           
            request_delete.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except ObjectDoesNotExist:
            # Return 404 if the record does not exist
            return Response("Data doesn't exist with this id", status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            # Log any other exceptions that occur
            logger.error(f"RECORD DELETE - {e}")
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
    return Response({"error": "Id is required"}, status=status.HTTP_400_BAD_REQUEST)
