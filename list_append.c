#include <stdio.h>
#include <stdlib.h>

typedef struct node
{
    int number;
    struct node *next;
} node;

int main(void)
{
    node *list = malloc(sizeof(node));
    if (list == NULL)
    {
        return 1;
    }
    
    node *n = list;

    for (int i = 0; i < 10; i++)
    {
        node *nx = malloc(sizeof(node));
        if (nx == NULL)
        {
            node *tmp = list;
            for (node *tmp = list; tmp != NULL; tmp = tmp->next)
            {
                node *ptr = tmp->next;
                free(tmp);
                tmp = ptr;
            }
            return 1;
        }
        n->number = i + 1;
        n->next = nx;
        nx->next = NULL;
        n = nx;      
    }

    n = list;

    while (n->next != NULL)
    {
        printf("%i\n", n->number);
        n = n->next;
    }

    node *tmp = NULL;
    while (list != NULL)
    {
        tmp = list->next;
        free(list);
        list = tmp;
    }
}