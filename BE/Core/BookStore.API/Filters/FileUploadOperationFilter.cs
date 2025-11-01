using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace BookStore.API.Filters;

public class FileUploadOperationFilter : IOperationFilter
{
    public void Apply(OpenApiOperation operation, OperationFilterContext context)
    {
        var fileParams = context.ApiDescription.ParameterDescriptions
            .Where(p => p.ModelMetadata?.ModelType == typeof(IFormFile))
            .ToList();

        if (!fileParams.Any())
            return;

        // Clear existing parameters
        operation.Parameters?.Clear();

        // Create multipart/form-data request body
        operation.RequestBody = new OpenApiRequestBody
        {
            Content = new Dictionary<string, OpenApiMediaType>
            {
                ["multipart/form-data"] = new OpenApiMediaType
                {
                    Schema = new OpenApiSchema
                    {
                        Type = "object",
                        Properties = new Dictionary<string, OpenApiSchema>(),
                        Required = new HashSet<string>()
                    }
                }
            }
        };

        var schema = operation.RequestBody.Content["multipart/form-data"].Schema;

        // Add file parameters
        foreach (var param in fileParams)
        {
            schema.Properties.Add(param.Name, new OpenApiSchema
            {
                Type = "string",
                Format = "binary"
            });
            schema.Required.Add(param.Name);
        }

        // Add other query/form parameters
        var otherParams = context.ApiDescription.ParameterDescriptions
            .Where(p => p.ModelMetadata?.ModelType != typeof(IFormFile))
            .ToList();

        foreach (var param in otherParams)
        {
            if (param.Source.Id == "Query")
            {
                operation.Parameters ??= new List<OpenApiParameter>();
                operation.Parameters.Add(new OpenApiParameter
                {
                    Name = param.Name,
                    In = ParameterLocation.Query,
                    Required = param.IsRequired,
                    Schema = new OpenApiSchema
                    {
                        Type = "string",
                        Nullable = !param.IsRequired
                    }
                });
            }
        }
    }
}
