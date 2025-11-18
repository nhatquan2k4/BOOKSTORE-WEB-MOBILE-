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

        // Add other query/form/route parameters
        var otherParams = context.ApiDescription.ParameterDescriptions
            .Where(p => p.ModelMetadata?.ModelType != typeof(IFormFile))
            .ToList();

        foreach (var param in otherParams)
        {
            if (param.Source.Id == "Query" || param.Source.Id == "Path")
            {
                operation.Parameters ??= new List<OpenApiParameter>();
                operation.Parameters.Add(new OpenApiParameter
                {
                    Name = param.Name,
                    In = param.Source.Id == "Path" ? ParameterLocation.Path : ParameterLocation.Query,
                    Required = param.IsRequired || param.Source.Id == "Path", // Path parameters are always required
                    Schema = new OpenApiSchema
                    {
                        Type = param.Type == typeof(Guid) ? "string" : "string",
                        Format = param.Type == typeof(Guid) ? "uuid" : null,
                        Nullable = !param.IsRequired && param.Source.Id != "Path"
                    }
                });
            }
        }
    }
}
